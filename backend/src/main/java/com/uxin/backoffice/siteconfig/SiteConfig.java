package com.uxin.backoffice.siteconfig;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 사이트 전역 설정 key-value (푸터 문구 등). */
@Entity
@Table(name = "site_config")
@Getter
@Setter
@NoArgsConstructor
public class SiteConfig {

  @Id
  @Column(name = "config_key")
  private String configKey;

  @Column(name = "config_value")
  private String configValue;

  public SiteConfig(String configKey, String configValue) {
    this.configKey = configKey;
    this.configValue = configValue;
  }
}
