package com.uxin.backoffice.inventory;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryTxRepository extends JpaRepository<InventoryTx, Long> {

  List<InventoryTx> findTop100ByOrderByIdDesc();

  List<InventoryTx> findByProductIdOrderByIdDesc(Long productId);

  void deleteByRefOrderId(Long refOrderId);
}
