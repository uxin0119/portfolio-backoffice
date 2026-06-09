package com.uxin.backoffice.commoncode;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 공통코드 — 그룹(group_code) 안의 코드(code)와 한글명(name). */
@Entity
@Table(name = "common_code")
@Getter
@Setter
@NoArgsConstructor
public class CommonCode {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "group_code", nullable = false)
  private String groupCode;

  @Column(nullable = false)
  private String code;

  @Column(nullable = false)
  private String name;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(nullable = false)
  private boolean active = true;
}
