package com.uxin.backoffice.dashboard;

import com.uxin.backoffice.order.Order;
import com.uxin.backoffice.order.OrderItem;
import com.uxin.backoffice.order.OrderItemRepository;
import com.uxin.backoffice.order.OrderRepository;
import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 대시보드 차트용 집계. 데이터 규모가 작아(수백 행) 자바단 집계로 충분. */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

  private static final ZoneId KST = ZoneId.of("Asia/Seoul");

  private final OrderRepository orderRepo;
  private final OrderItemRepository itemRepo;
  private final ProductRepository productRepo;

  public StatsController(
      OrderRepository orderRepo, OrderItemRepository itemRepo, ProductRepository productRepo) {
    this.orderRepo = orderRepo;
    this.itemRepo = itemRepo;
    this.productRepo = productRepo;
  }

  public record DailyRevenue(String date, long revenue, long orders) {}

  public record CategorySales(String category, long amount) {}

  /** dow: 0=월 … 6=일, hour: 0~23 */
  public record HeatCell(int dow, int hour, long count) {}

  public record StatusCount(String status, long count) {}

  public record StockHealth(String name, String sku, int stockQty, int safetyStock) {}

  public record StatsRes(
      List<DailyRevenue> dailyRevenue,
      List<CategorySales> categorySales,
      List<HeatCell> orderHeatmap,
      List<StatusCount> statusCounts,
      List<StockHealth> stockHealth) {}

  @GetMapping("/dashboard")
  public StatsRes dashboard() {
    List<Order> orders = orderRepo.findAll();
    LocalDate today = LocalDate.now(KST);
    LocalDate from = today.minusDays(29);

    // 1) 최근 30일 일별 매출(취소 제외) — 빈 날짜도 0으로 채움
    Map<LocalDate, List<Order>> byDate = orders.stream()
        .filter(o -> !"CANCELLED".equals(o.getStatus()))
        .filter(o -> o.getOrderDate() != null && !o.getOrderDate().isBefore(from))
        .collect(Collectors.groupingBy(Order::getOrderDate));
    List<DailyRevenue> daily = new ArrayList<>();
    for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
      List<Order> os = byDate.getOrDefault(d, List.of());
      daily.add(new DailyRevenue(
          d.toString(), os.stream().mapToLong(Order::getTotalAmount).sum(), os.size()));
    }

    // 2) 카테고리별 매출(전체 기간, 취소 제외)
    Map<Long, String> productCategory = productRepo.findAll().stream()
        .collect(Collectors.toMap(Product::getId, p -> p.getCategory() == null ? "기타" : p.getCategory(), (a, b) -> a));
    Map<Long, Order> orderById = orders.stream().collect(Collectors.toMap(Order::getId, Function.identity()));
    Map<String, Long> catSum = new LinkedHashMap<>();
    for (OrderItem it : itemRepo.findAll()) {
      Order o = orderById.get(it.getOrderId());
      if (o == null || "CANCELLED".equals(o.getStatus())) continue;
      String cat = productCategory.getOrDefault(it.getProductId(), "기타");
      catSum.merge(cat, (long) it.getLineAmount(), Long::sum);
    }
    List<CategorySales> cats = catSum.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .map(e -> new CategorySales(e.getKey(), e.getValue()))
        .toList();

    // 3) 요일×시간대 주문 히트맵(생성 시각 기준, KST)
    Map<String, Long> heat = orders.stream()
        .filter(o -> o.getCreatedAt() != null)
        .collect(Collectors.groupingBy(o -> {
          OffsetDateTime t = o.getCreatedAt().atZoneSameInstant(KST).toOffsetDateTime();
          int dow = t.getDayOfWeek().getValue() - 1; // 0=월
          return dow + ":" + t.getHour();
        }, Collectors.counting()));
    List<HeatCell> cells = heat.entrySet().stream()
        .map(e -> {
          String[] k = e.getKey().split(":");
          return new HeatCell(Integer.parseInt(k[0]), Integer.parseInt(k[1]), e.getValue());
        })
        .toList();

    // 4) 상태 분포
    List<StatusCount> statuses = orders.stream()
        .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()))
        .entrySet().stream()
        .map(e -> new StatusCount(e.getKey(), e.getValue()))
        .toList();

    // 5) 재고 건강도(안전재고 대비 부족 상품, 부족률 높은 순 8개)
    List<StockHealth> stock = productRepo.findLowStock().stream()
        .sorted((a, b) -> Double.compare(
            (double) a.getStockQty() / Math.max(1, a.getSafetyStock()),
            (double) b.getStockQty() / Math.max(1, b.getSafetyStock())))
        .limit(8)
        .map(p -> new StockHealth(p.getName(), p.getSku(), p.getStockQty(), p.getSafetyStock()))
        .toList();

    return new StatsRes(daily, cats, cells, statuses, stock);
  }
}
