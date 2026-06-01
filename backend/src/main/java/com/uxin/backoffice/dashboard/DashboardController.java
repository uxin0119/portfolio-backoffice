package com.uxin.backoffice.dashboard;

import com.uxin.backoffice.customer.Customer;
import com.uxin.backoffice.customer.CustomerRepository;
import com.uxin.backoffice.order.Order;
import com.uxin.backoffice.order.OrderRepository;
import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final OrderRepository orderRepo;
  private final ProductRepository productRepo;
  private final CustomerRepository customerRepo;

  public DashboardController(
      OrderRepository orderRepo, ProductRepository productRepo, CustomerRepository customerRepo) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
    this.customerRepo = customerRepo;
  }

  public record Kpi(long todayOrders, long monthRevenue, long lowStockCount, long activeCustomers) {}

  public record RecentOrder(
      Long id, String orderNo, String customerName, String status, int totalAmount) {}

  public record LowStock(Long id, String name, String sku, int stockQty, int safetyStock) {}

  public record DashboardRes(Kpi kpi, List<RecentOrder> recentOrders, List<LowStock> lowStock) {}

  @GetMapping
  public DashboardRes summary() {
    LocalDate today = LocalDate.now();
    LocalDate monthStart = today.withDayOfMonth(1);

    Kpi kpi = new Kpi(
        orderRepo.countByOrderDate(today),
        orderRepo.sumRevenueSince(monthStart),
        productRepo.countLowStock(),
        customerRepo.countByStatus("ACTIVE"));

    Map<Long, String> names = customerRepo.findAll().stream()
        .collect(Collectors.toMap(Customer::getId, Customer::getName));

    List<RecentOrder> recent = orderRepo.findTop5ByOrderByIdDesc().stream()
        .map(o -> new RecentOrder(
            o.getId(), o.getOrderNo(),
            names.getOrDefault(o.getCustomerId(), "-"),
            o.getStatus(), o.getTotalAmount()))
        .toList();

    List<LowStock> low = productRepo.findLowStock().stream()
        .map(p -> new LowStock(p.getId(), p.getName(), p.getSku(), p.getStockQty(), p.getSafetyStock()))
        .toList();

    return new DashboardRes(kpi, recent, low);
  }
}
