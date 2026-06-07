package com.uxin.backoffice.siteconfig;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 사이트 전역 설정 — 조회(공개) / 일괄 수정(관리자). */
@RestController
@RequestMapping("/api/config")
public class ConfigController {

  private final SiteConfigRepository repo;

  public ConfigController(SiteConfigRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public Map<String, String> all() {
    Map<String, String> m = new LinkedHashMap<>();
    repo.findAll().forEach(c -> m.put(c.getConfigKey(), c.getConfigValue()));
    return m;
  }

  @PutMapping
  public Map<String, String> update(@RequestBody Map<String, String> body) {
    body.forEach((k, v) -> {
      SiteConfig c = repo.findById(k).orElseGet(() -> new SiteConfig(k, null));
      c.setConfigValue(v);
      repo.save(c);
    });
    return all();
  }
}
