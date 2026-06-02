package com.uxin.backoffice.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Supabase Storage 업로드. 파일은 스토리지에 저장하고 공개 URL을 반환한다.
 * url/service-key 미설정 시 비활성(enabled=false) → 호출 측이 폴백 처리.
 */
@Service
public class SupabaseStorage {

  private final String url;
  private final String key;
  private final String bucket;
  private final boolean enabled;
  private final RestClient http;

  public SupabaseStorage(
      @Value("${supabase.url:}") String url,
      @Value("${supabase.service-key:}") String key,
      @Value("${supabase.bucket:product-images}") String bucket) {
    this.url = url == null ? "" : url.replaceAll("/+$", "");
    this.key = key == null ? "" : key;
    this.bucket = bucket;
    this.enabled = !this.url.isBlank() && !this.key.isBlank();

    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(10000);
    f.setReadTimeout(90000); // Pollinations 생성 대기 등 대비
    this.http = RestClient.builder().requestFactory(f).build();
  }

  public boolean isEnabled() {
    return enabled;
  }

  /** 외부 URL의 이미지 바이트를 받아온다. */
  public byte[] fetch(String sourceUrl) {
    return http.get().uri(sourceUrl).retrieve().body(byte[].class);
  }

  /** 버킷의 path에 바이트 업로드 후 공개 URL 반환. */
  public String upload(String path, byte[] bytes, String contentType) {
    http.post()
        .uri(url + "/storage/v1/object/" + bucket + "/" + path)
        .header("Authorization", "Bearer " + key)
        .header("apikey", key)
        .header("x-upsert", "true")
        .contentType(MediaType.parseMediaType(contentType))
        .body(bytes)
        .retrieve()
        .toBodilessEntity();
    return url + "/storage/v1/object/public/" + bucket + "/" + path;
  }
}
