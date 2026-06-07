package com.uxin.backoffice.product;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductRepository repo;
  private final ProductImageService imageService;

  public ProductController(ProductRepository repo, ProductImageService imageService) {
    this.repo = repo;
    this.imageService = imageService;
  }

  public record ProductReq(
      String sku,
      String name,
      String category,
      String tags,
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
      String tags,
      int basePrice,
      int stockQty,
      int safetyStock,
      String status,
      String imageUrl,
      boolean lowStock) {
    static ProductRes of(Product p) {
      return new ProductRes(
          p.getId(), p.getSku(), p.getName(), p.getCategory(), p.getTags(),
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

  /** 아직 Supabase에 없는 상품 이미지를 생성→업로드→image_url 교체 (limit개). */
  @PostMapping("/backfill-images")
  public Map<String, Object> backfillImages(@RequestParam(defaultValue = "8") int limit) {
    int attempted = 0, stored = 0, failed = 0;
    for (Product p : repo.findAll()) {
      if (attempted >= limit) break;
      if (imageService.isStored(p)) continue;
      attempted++;
      if (imageService.store(p)) stored++;
      else failed++;
    }
    return Map.of("attempted", attempted, "stored", stored, "failed", failed);
  }

  private void apply(Product p, ProductReq r) {
    if (r.sku() != null) p.setSku(r.sku());
    if (r.name() != null) p.setName(r.name());
    p.setCategory(r.category());
    if (r.tags() != null) p.setTags(r.tags().isBlank() ? null : r.tags().trim());
    if (r.basePrice() != null) p.setBasePrice(r.basePrice());
    if (r.stockQty() != null) p.setStockQty(r.stockQty());
    if (r.safetyStock() != null) p.setSafetyStock(r.safetyStock());
    if (r.status() != null) p.setStatus(r.status());
    if (r.imageUrl() != null) p.setImageUrl(r.imageUrl());
  }
}
