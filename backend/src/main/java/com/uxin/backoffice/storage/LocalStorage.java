package com.uxin.backoffice.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * 로컬 파일시스템 구현 (자체호스트용). dir에 파일 저장, baseUrl + path 를 공개 URL로 반환.
 * 예: dir=/var/www/product-images, baseUrl=https://example.com/files
 *     → /var/www/product-images/p/1.jpg, URL=https://example.com/files/p/1.jpg
 * 파일 서빙은 nginx 등 정적 서버가 baseUrl ↔ dir 를 매핑.
 */
public class LocalStorage implements Storage {

  private final Path dir;
  private final String baseUrl;
  private final boolean enabled;

  public LocalStorage(String dir, String baseUrl) {
    this.baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
    this.dir = (dir == null || dir.isBlank()) ? null : Path.of(dir);
    this.enabled = this.dir != null && !this.baseUrl.isBlank();
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }

  @Override
  public boolean owns(String u) {
    return u != null && !baseUrl.isBlank() && u.startsWith(baseUrl);
  }

  @Override
  public String upload(String path, byte[] bytes, String contentType) {
    try {
      Path target = dir.resolve(path);
      Files.createDirectories(target.getParent());
      Files.write(target, bytes);
      return baseUrl + "/" + path;
    } catch (IOException e) {
      throw new UncheckedIOException("로컬 파일 저장 실패: " + path, e);
    }
  }
}
