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

  @Column(nullable = false)
  private String status = "ACCEPTED";

  @Column(name = "order_date", nullable = false)
  private LocalDate orderDate;

  @Column(name = "total_amount", nullable = false)
  private int totalAmount;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (orderDate == null) orderDate = LocalDate.now();
    if (status == null) status = "ACCEPTED";
  }
}
