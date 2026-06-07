package com.uxin.backoffice.order;

import com.uxin.backoffice.customer.Customer;
import com.uxin.backoffice.customer.CustomerRepository;
import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService service;
  private final OrderRepository orderRepo;
  private final OrderItemRepository itemRepo;
  private final ProductRepository productRepo;
  private final CustomerRepository customerRepo;

  public OrderController(
      OrderService service,
      OrderRepository orderRepo,
      OrderItemRepository itemRepo,
      ProductRepository productRepo,
      CustomerRepository customerRepo) {
    this.service = service;
    this.orderRepo = orderRepo;
    this.itemRepo = itemRepo;
    this.productRepo = productRepo;
    this.customerRepo = customerRepo;
  }

  public record ItemLine(Long productId, Integer qty) {}

  public record CreateReq(
      Long customerId, List<ItemLine> items,
      String recipientName, String recipientPhone,
      String postcode, String address, String addressDetail) {}

  public record StatusReq(String status) {}

  public record OrderRes(
      Long id, String orderNo, Long customerId, String customerName,
      String status, LocalDate orderDate, int totalAmount, int itemCount) {}

  public record ItemRes(
      Long id, Long productId, String productName, int qty, int unitPrice, int lineAmount) {}

  public record OrderDetail(
      Long id, String orderNo, Long customerId, String customerName,
      String status, LocalDate orderDate, int totalAmount, List<ItemRes> items,
      String recipientName, String recipientPhone,
      String shipPostcode, String shipAddress, String shipAddressDetail) {}

  @GetMapping
  public List<OrderRes> list() {
    Map<Long, String> names = customerRepo.findAll().stream()
        .collect(Collectors.toMap(Customer::getId, Customer::getName));
    return orderRepo.findAll().stream()
        .sorted((a, b) -> b.getId().compareTo(a.getId()))
        .map(o -> new OrderRes(
            o.getId(), o.getOrderNo(), o.getCustomerId(),
            names.getOrDefault(o.getCustomerId(), "-"),
            o.getStatus(), o.getOrderDate(), o.getTotalAmount(),
            itemRepo.findByOrderId(o.getId()).size()))
        .toList();
  }

  @GetMapping("/{id}")
  public OrderDetail get(@PathVariable Long id) {
    Order o = orderRepo.findById(id).orElseThrow();
    String customerName = customerRepo.findById(o.getCustomerId())
        .map(Customer::getName).orElse("-");
    Map<Long, String> pnames = productRepo.findAll().stream()
        .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));
    List<ItemRes> items = itemRepo.findByOrderId(id).stream()
        .map(it -> new ItemRes(
            it.getId(), it.getProductId(),
            pnames.getOrDefault(it.getProductId(), "-"),
            it.getQty(), it.getUnitPrice(), it.getLineAmount()))
        .toList();
    return new OrderDetail(o.getId(), o.getOrderNo(), o.getCustomerId(), customerName,
        o.getStatus(), o.getOrderDate(), o.getTotalAmount(), items,
        o.getRecipientName(), o.getRecipientPhone(),
        o.getShipPostcode(), o.getShipAddress(), o.getShipAddressDetail());
  }

  @PostMapping
  public OrderDetail create(@RequestBody CreateReq r) {
    var items = r.items().stream()
        .map(i -> new OrderService.ItemReq(i.productId(), i.qty()))
        .toList();
    var ship = new OrderService.Shipping(
        r.recipientName(), r.recipientPhone(), r.postcode(), r.address(), r.addressDetail());
    Order o = service.create(r.customerId(), items, ship);
    return get(o.getId());
  }

  @PatchMapping("/{id}/status")
  public OrderDetail changeStatus(@PathVariable Long id, @RequestBody StatusReq r) {
    service.changeStatus(id, r.status());
    return get(id);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    // order_item 은 FK ON DELETE CASCADE. inventory_tx 참조는 먼저 정리.
    orderRepo.deleteById(id);
  }
}
