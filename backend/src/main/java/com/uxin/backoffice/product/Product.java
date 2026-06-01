package com.uxin.backoffice.product;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String sku;

  @Column(nullable = false)
  private String name;

  private String category;

  @Column(name = "base_price", nullable = false)
  private int basePrice;

  @Column(name = "stock_qty", nullable = false)
  private int stockQty;

  @Column(name = "safety_stock", nullable = false)
  private int safetyStock;

  @Column(nullable = false)
  private String status = "ACTIVE";

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (status == null) status = "ACTIVE";
  }
}
