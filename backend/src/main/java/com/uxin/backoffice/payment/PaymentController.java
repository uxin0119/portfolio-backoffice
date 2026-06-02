package com.uxin.backoffice.payment;

import com.uxin.backoffice.order.Order;
import com.uxin.backoffice.order.OrderRepository;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

/**
 * 토스페이먼츠 결제 승인.
 * 1) 주문 존재 + 결제 금액 == 주문 금액 검증(위변조 방지)
 * 2) 유효한 test secret key가 있으면 Toss confirm 호출, 없으면 데모 승인 폴백
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

  private static final String TOSS_CONFIRM = "https://api.tosspayments.com/v1/payments/confirm";
  private final String secretKey;
  private final OrderRepository orderRepo;
  private final RestClient http = RestClient.create();

  public PaymentController(@Value("${toss.secret-key:}") String secretKey, OrderRepository orderRepo) {
    this.secretKey = secretKey;
    this.orderRepo = orderRepo;
  }

  public record ConfirmReq(String paymentKey, String orderId, Integer amount) {}

  @PostMapping("/confirm")
  public Map<String, Object> confirm(@RequestBody ConfirmReq r) {
    // 1) 주문 존재 + 금액 검증
    Order order = orderRepo.findByOrderNo(r.orderId()).orElse(null);
    if (order == null) {
      return Map.of("status", "REJECTED", "reason", "주문을 찾을 수 없음",
          "orderId", String.valueOf(r.orderId()));
    }
    int expected = order.getTotalAmount();
    int got = r.amount() == null ? -1 : r.amount();
    if (got != expected) {
      return Map.of("status", "REJECTED", "reason", "결제 금액 불일치",
          "expected", expected, "got", got);
    }

    // 2) 승인
    boolean demoKey = secretKey == null || secretKey.isBlank()
        || secretKey.contains("demo") || secretKey.contains("PLACEHOLDER");
    if (!demoKey) {
      try {
        String basic = "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes());
        Object res = http.post().uri(TOSS_CONFIRM)
            .header("Authorization", basic)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("paymentKey", r.paymentKey(), "orderId", r.orderId(), "amount", r.amount()))
            .retrieve()
            .body(Object.class);
        return Map.of("status", "DONE", "provider", "toss", "amount", expected,
            "raw", res == null ? Map.of() : res);
      } catch (Exception e) {
        return Map.of("status", "DEMO_DONE", "provider", "demo", "amount", expected,
            "message", "Toss confirm 실패 → 데모 승인 처리(금액 검증 통과)",
            "error", String.valueOf(e.getMessage()));
      }
    }
    return Map.of("status", "DEMO_DONE", "provider", "demo", "amount", expected,
        "message", "유효한 Toss test secret key 미설정 → 데모 승인(금액 검증 통과)",
        "orderId", r.orderId());
  }
}
