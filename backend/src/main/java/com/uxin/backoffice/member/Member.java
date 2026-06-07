package com.uxin.backoffice.member;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "login_id", nullable = false, unique = true)
  private String loginId;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private String name;

  // 주문·배송용 연락처/주소 (가입 시 선택 입력, 기존 회원 호환 위해 nullable)
  @Column private String email;

  @Column private String phone;

  @Column private String postcode;

  @Column private String address;

  @Column(name = "address_detail")
  private String addressDetail;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
  }
}
