package com.uxin.backoffice.order;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_no", nullable = false, unique = true)
  private String orderNo;

  @Column(name = "customer_id", nullable = false)
  private Long customerId;

  // 주문한 회원(로그인 구매 시). 게스트/시더 주문은 null.
  @Column(name = "member_id")
  private Long memberId;

  @Column(nullable = false)
  private String status = "ACCEPTED";

  @Column(name = "order_date", nullable = false)
  private LocalDate orderDate;

  @Column(name = "total_amount", nullable = false)
  private int totalAmount;

  // 배송 스냅샷 (체크아웃 시점 고정)
  @Column(name = "recipient_name")
  private String recipientName;

  @Column(name = "recipient_phone")
  private String recipientPhone;

  @Column(name = "ship_postcode")
  private String shipPostcode;

  @Column(name = "ship_address")
  private String shipAddress;

  @Column(name = "ship_address_detail")
  private String shipAddressDetail;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (orderDate == null) orderDate = LocalDate.now();
    if (status == null) status = "ACCEPTED";
  }
}
