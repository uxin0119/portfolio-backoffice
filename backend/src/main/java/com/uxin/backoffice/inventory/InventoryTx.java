package com.uxin.backoffice.inventory;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_tx")
@Getter
@Setter
@NoArgsConstructor
public class InventoryTx {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "product_id", nullable = false)
  private Long productId;

  /** IN / OUT */
  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private int qty;

  @Column(name = "ref_order_id")
  private Long refOrderId;

  private String memo;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
  }
}
