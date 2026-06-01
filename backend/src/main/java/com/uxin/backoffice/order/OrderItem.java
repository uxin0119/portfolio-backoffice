package com.uxin.backoffice.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_id", nullable = false)
  private Long orderId;

  @Column(name = "product_id", nullable = false)
  private Long productId;

  @Column(nullable = false)
  private int qty;

  @Column(name = "unit_price", nullable = false)
  private int unitPrice;

  @Column(name = "line_amount", nullable = false)
  private int lineAmount;
}
