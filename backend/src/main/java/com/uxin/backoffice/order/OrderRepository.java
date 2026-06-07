package com.uxin.backoffice.order;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

  List<Order> findTop5ByOrderByIdDesc();

  List<Order> findByMemberIdOrderByIdDesc(Long memberId);

  Optional<Order> findByOrderNo(String orderNo);

  long countByOrderDate(LocalDate date);

  @Query("select coalesce(sum(o.totalAmount), 0) from Order o "
      + "where o.status <> 'CANCELLED' and o.orderDate >= :from")
  long sumRevenueSince(@Param("from") LocalDate from);
}
