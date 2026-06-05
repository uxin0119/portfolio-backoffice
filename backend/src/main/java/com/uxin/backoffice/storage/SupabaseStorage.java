package com.uxin.backoffice.storage;

import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/** Supabase Storage 구현. url/service-key 미설정 시 비활성. */
public class SupabaseStorage implements Storage {

  private final String url;
  private final String key;
  private final String bucket;
  private final boolean enabled;
  private final RestClient http;

  public SupabaseStorage(String url, String key, String bucket) {
    this.url = url == null ? "" : url.replaceAll("/+$", "");
    this.key = key == null ? "" : key;
    this.bucket = bucket;
    this.enabled = !this.url.isBlank() && !this.key.isBlank();

    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(10000);
    f.setReadTimeout(90000);
    this.http = RestClient.builder().requestFactory(f).build();
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }

  @Override
  public boolean owns(String u) {
    return u != null && u.contains("/storage/v1/object/public/");
  }

  @Override
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
