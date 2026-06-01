package com.uxin.backoffice.inventory;

import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 재고 입출고 단일 경로. 상품 stock_qty 변경 + inventory_tx 기록을 한 트랜잭션에서 처리.
 * 주문↔재고 자동연동(OrderService)과 수동 조정(InventoryController)이 모두 이 메서드를 통과.
 */
@Service
public class InventoryService {

  private final ProductRepository productRepo;
  private final InventoryTxRepository txRepo;

  public InventoryService(ProductRepository productRepo, InventoryTxRepository txRepo) {
    this.productRepo = productRepo;
    this.txRepo = txRepo;
  }

  @Transactional
  public InventoryTx record(Long productId, String type, int qty, Long refOrderId, String memo) {
    if (qty <= 0) throw new IllegalArgumentException("qty must be > 0");
    Product p = productRepo.findById(productId).orElseThrow();

    if ("OUT".equals(type)) {
      p.setStockQty(p.getStockQty() - qty);
    } else if ("IN".equals(type)) {
      p.setStockQty(p.getStockQty() + qty);
    } else {
      throw new IllegalArgumentException("type must be IN or OUT");
    }
    if (p.getStockQty() < 0) {
      throw new IllegalStateException("재고가 부족합니다: " + p.getName());
    }
    productRepo.save(p);

    InventoryTx tx = new InventoryTx();
    tx.setProductId(productId);
    tx.setType(type);
    tx.setQty(qty);
    tx.setRefOrderId(refOrderId);
    tx.setMemo(memo);
    return txRepo.save(tx);
  }
}
