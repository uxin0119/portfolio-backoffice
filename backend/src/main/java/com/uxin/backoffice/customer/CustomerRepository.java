package com.uxin.backoffice.customer;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

  List<Customer> findByNameContainingIgnoreCase(String name);

  long countByStatus(String status);
}
