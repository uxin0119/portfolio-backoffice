package com.uxin.backoffice.product;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductRepository repo;

  public ProductController(ProductRepository repo) {
    this.repo = repo;
  }

  public record ProductReq(
      String sku,
      String name,
      String category,
      Integer basePrice,
      Integer stockQty,
      Integer safetyStock,
      String status,
      String imageUrl) {}

  public record ProductRes(
      Long id,
      String sku,
      String name,
      String category,
      int basePrice,
      int stockQty,
      int safetyStock,
      String status,
      String imageUrl,
      boolean lowStock) {
    static ProductRes of(Product p) {
      return new ProductRes(
          p.getId(), p.getSku(), p.getName(), p.getCategory(),
          p.getBasePrice(), p.getStockQty(), p.getSafetyStock(),
          p.getStatus(), p.getImageUrl(), p.getStockQty() < p.getSafetyStock());
    }
  }

  @GetMapping
  public List<ProductRes> list(@RequestParam(required = false) String q) {
    var items = (q == null || q.isBlank())
        ? repo.findAll()
        : repo.findByNameContainingIgnoreCase(q);
    return items.stream().map(ProductRes::of).toList();
  }

  @GetMapping("/{id}")
  public ProductRes get(@PathVariable Long id) {
    return ProductRes.of(repo.findById(id).orElseThrow());
  }

  @PostMapping
  public ProductRes create(@RequestBody ProductReq r) {
    Product p = new Product();
    apply(p, r);
    if (p.getImageUrl() == null || p.getImageUrl().isBlank()) {
      p.setImageUrl(ProductImages.imageFor(p.getName(), p.getSku() == null ? 0 : p.getSku().hashCode()));
    }
    return ProductRes.of(repo.save(p));
  }

  @PutMapping("/{id}")
  public ProductRes update(@PathVariable Long id, @RequestBody ProductReq r) {
    Product p = repo.findById(id).orElseThrow();
    apply(p, r);
    return ProductRes.of(repo.save(p));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }

  private void apply(Product p, ProductReq r) {
    if (r.sku() != null) p.setSku(r.sku());
    if (r.name() != null) p.setName(r.name());
    p.setCategory(r.category());
    if (r.basePrice() != null) p.setBasePrice(r.basePrice());
    if (r.stockQty() != null) p.setStockQty(r.stockQty());
    if (r.safetyStock() != null) p.setSafetyStock(r.safetyStock());
    if (r.status() != null) p.setStatus(r.status());
    if (r.imageUrl() != null) p.setImageUrl(r.imageUrl());
  }
}
