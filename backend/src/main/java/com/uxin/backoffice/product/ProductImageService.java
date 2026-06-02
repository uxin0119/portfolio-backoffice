package com.uxin.backoffice.product;

import com.uxin.backoffice.storage.SupabaseStorage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 상품 이미지를 Supabase Storage에 저장하고 product.image_url을 그 공개 URL로 갱신.
 * 패턴: 파일=스토리지, DB=URL 참조. 스토리지 비활성/실패 시 기존(Pollinations) URL 유지.
 */
@Service
public class ProductImageService {

  private final SupabaseStorage storage;
  private final ProductRepository repo;

  public ProductImageService(SupabaseStorage storage, ProductRepository repo) {
    this.storage = storage;
    this.repo = repo;
  }

  public boolean isStored(Product p) {
    return p.getImageUrl() != null && p.getImageUrl().contains("/storage/v1/object/public/");
  }

  /** 이미 Supabase에 저장됐으면 skip. 아니면 생성 이미지 → 업로드 → image_url 교체. */
  @Transactional
  public boolean storeToSupabase(Product p) {
    if (!storage.isEnabled() || isStored(p)) return false;
    try {
      String src = (p.getImageUrl() != null && !p.getImageUrl().isBlank())
          ? p.getImageUrl()
          : ProductImages.imageFor(p.getName(), p.getSku() == null ? 0 : p.getSku().hashCode());
      byte[] bytes = storage.fetch(src);
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
