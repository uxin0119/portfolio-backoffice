package com.uxin.backoffice.inventory;

import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

  private final InventoryTxRepository txRepo;
  private final InventoryService service;
  private final ProductRepository productRepo;

  public InventoryController(
      InventoryTxRepository txRepo, InventoryService service, ProductRepository productRepo) {
    this.txRepo = txRepo;
    this.service = service;
    this.productRepo = productRepo;
  }

  public record AdjustReq(Long productId, String type, Integer qty, String memo) {}

  public record TxRes(
      Long id, Long productId, String productName, String type, int qty,
      Long refOrderId, String memo, String createdAt) {}

  @GetMapping
  public List<TxRes> list(@RequestParam(required = false) Long productId) {
    var rows = (productId == null)
        ? txRepo.findTop100ByOrderByIdDesc()
        : txRepo.findByProductIdOrderByIdDesc(productId);
    Map<Long, String> names = productRepo.findAll().stream()
        .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));
    return rows.stream()
        .map(t -> new TxRes(
            t.getId(), t.getProductId(),
            names.getOrDefault(t.getProductId(), "-"),
            t.getType(), t.getQty(), t.getRefOrderId(), t.getMemo(),
            t.getCreatedAt() == null ? null : t.getCreatedAt().toString()))
        .toList();
  }

  @PostMapping("/adjust")
  public TxRes adjust(@RequestBody AdjustReq r) {
    InventoryTx t = service.record(r.productId(), r.type(), r.qty(), null, r.memo());
    String name = productRepo.findById(t.getProductId()).map(Product::getName).orElse("-");
    return new TxRes(t.getId(), t.getProductId(), name, t.getType(), t.getQty(),
        t.getRefOrderId(), t.getMemo(),
        t.getCreatedAt() == null ? null : t.getCreatedAt().toString());
  }
}
