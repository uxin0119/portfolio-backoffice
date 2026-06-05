package com.uxin.backoffice.product;

import com.uxin.backoffice.storage.Storage;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

/**
 * 상품 이미지를 활성 Storage(Supabase 또는 로컬)에 저장하고 product.image_url을 그 공개 URL로 갱신.
 * 패턴: 파일=스토리지, DB=URL 참조. 스토리지 비활성/실패 시 기존(Pollinations) URL 유지.
 */
@Service
public class ProductImageService {

  private final Storage storage;
  private final ProductRepository repo;
  private final RestClient http;

  public ProductImageService(Storage storage, ProductRepository repo) {
    this.storage = storage;
    this.repo = repo;
    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(10000);
    f.setReadTimeout(90000); // Pollinations 생성 대기 등 대비
    this.http = RestClient.builder().requestFactory(f).build();
  }

  /** 이미 활성 스토리지에 저장된 URL인지 */
  public boolean isStored(Product p) {
    return p.getImageUrl() != null && storage.owns(p.getImageUrl());
  }

  /** 생성 이미지(또는 현재 image_url) → 다운로드 → 스토리지 업로드 → image_url 교체. */
  @Transactional
  public boolean store(Product p) {
    if (!storage.isEnabled() || isStored(p)) return false;
    try {
      String src = (p.getImageUrl() != null && !p.getImageUrl().isBlank())
          ? p.getImageUrl()
          : ProductImages.imageFor(p.getName(), p.getSku() == null ? 0 : p.getSku().hashCode());
      byte[] bytes = http.get().uri(src).retrieve().body(byte[].class);
      if (bytes == null || bytes.length == 0) return false;
      String publicUrl = storage.upload("p/" + p.getId() + ".jpg", bytes, "image/jpeg");
      p.setImageUrl(publicUrl);
      repo.save(p);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
