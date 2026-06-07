package com.uxin.backoffice.order;

import com.uxin.backoffice.inventory.InventoryService;
import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private static final DateTimeFormatter YYMMDD = DateTimeFormatter.ofPattern("yyMMdd");

  private final OrderRepository orderRepo;
  private final OrderItemRepository itemRepo;
  private final ProductRepository productRepo;
  private final InventoryService inventory;

  public OrderService(
      OrderRepository orderRepo,
      OrderItemRepository itemRepo,
      ProductRepository productRepo,
      InventoryService inventory) {
    this.orderRepo = orderRepo;
    this.itemRepo = itemRepo;
    this.productRepo = productRepo;
    this.inventory = inventory;
  }

  public record ItemReq(Long productId, int qty) {}

  /** 배송 스냅샷 (체크아웃 시점 수령인/주소). null이면 미지정. */
  public record Shipping(
      String recipientName, String recipientPhone,
      String postcode, String address, String addressDetail) {}

  /** 배송정보/회원 없이 생성(시더/내부용). */
  @Transactional
  public Order create(Long customerId, List<ItemReq> items) {
    return create(customerId, null, items, null);
  }

  @Transactional
  public Order create(Long customerId, Long memberId, List<ItemReq> items, Shipping ship) {
    Order o = new Order();
    o.setCustomerId(customerId);
    o.setMemberId(memberId);
    o.setStatus("ACCEPTED");
    o.setOrderDate(LocalDate.now());
    o.setOrderNo(genOrderNo());
    o.setTotalAmount(0);
    if (ship != null) {
      o.setRecipientName(ship.recipientName());
      o.setRecipientPhone(ship.recipientPhone());
      o.setShipPostcode(ship.postcode());
      o.setShipAddress(ship.address());
      o.setShipAddressDetail(ship.addressDetail());
    }
    o = orderRepo.save(o);

    int total = 0;
    for (ItemReq it : items) {
      Product p = productRepo.findById(it.productId()).orElseThrow();
      int unit = p.getBasePrice();
      int line = unit * it.qty();
      OrderItem oi = new OrderItem();
      oi.setOrderId(o.getId());
      oi.setProductId(p.getId());
      oi.setQty(it.qty());
      oi.setUnitPrice(unit);
      oi.setLineAmount(line);
      itemRepo.save(oi);
      total += line;
    }
    o.setTotalAmount(total);
    return orderRepo.save(o);
  }

  /**
   * ★ 시그니처: 상태 전이 시 재고 자동연동.
   * - SHIPPED 진입(ACCEPTED→SHIPPED): 각 항목 OUT, 재고 차감
   * - SHIPPED 이탈(SHIPPED→ACCEPTED/CANCELLED): IN, 재고 복원
   * 전부 한 트랜잭션 → 부분 성공 없음.
   */
  @Transactional
  public Order changeStatus(Long id, String to) {
    Order o = orderRepo.findById(id).orElseThrow();
    String from = o.getStatus();
    if (from.equals(to)) return o;

    boolean entersShipped = "SHIPPED".equals(to) && !"SHIPPED".equals(from);
    boolean leavesShipped = "SHIPPED".equals(from) && !"SHIPPED".equals(to);

    if (entersShipped) {
      for (OrderItem it : itemRepo.findByOrderId(id)) {
        inventory.record(it.getProductId(), "OUT", it.getQty(), id, "주문 발송 " + o.getOrderNo());
      }
    } else if (leavesShipped) {
      for (OrderItem it : itemRepo.findByOrderId(id)) {
        inventory.record(it.getProductId(), "IN", it.getQty(), id, "주문 롤백 " + o.getOrderNo());
      }
    }
    o.setStatus(to);
    return orderRepo.save(o);
  }

  private String genOrderNo() {
    LocalDate t = LocalDate.now();
    long n = orderRepo.countByOrderDate(t) + 1;
    return String.format("ORD-%s-%03d", t.format(YYMMDD), n);
  }
}
