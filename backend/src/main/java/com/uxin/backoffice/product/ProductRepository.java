package com.uxin.backoffice.product;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

  List<Product> findByNameContainingIgnoreCase(String name);

  @Query("select p from Product p where p.stockQty < p.safetyStock order by p.stockQty asc")
  List<Product> findLowStock();

  @Query("select count(p) from Product p where p.stockQty < p.safetyStock")
  long countLowStock();
}
