package com.uxin.backoffice.payment;

import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

/**
 * 토스페이먼츠 결제 승인 데모.
 * 프론트 결제 성공 → paymentKey/orderId/amount 로 Toss confirm 호출.
 * 유효한 test secret key가 없으면 데모 모드(시뮬레이션 승인)로 폴백 — 데모 흐름 보장.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

  private static final String TOSS_CONFIRM = "https://api.tosspayments.com/v1/payments/confirm";
  private final String secretKey;
  private final RestClient http = RestClient.create();

  public PaymentController(@Value("${toss.secret-key:}") String secretKey) {
    this.secretKey = secretKey;
  }

  public record ConfirmReq(String paymentKey, String orderId, Integer amount) {}

  @PostMapping("/confirm")
  public Map<String, Object> confirm(@RequestBody ConfirmReq r) {
    // 데모 폴백 조건: 키 미설정/placeholder
    boolean demoKey = secretKey == null || secretKey.isBlank() || secretKey.contains("demo") || secretKey.contains("PLACEHOLDER");
    if (!demoKey) {
      try {
        String basic = "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes());
        Object res = http.post().uri(TOSS_CONFIRM)
            .header("Authorization", basic)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of("paymentKey", r.paymentKey(), "orderId", r.orderId(), "amount", r.amount()))
            .retrieve()
            .body(Object.class);
        return Map.of("status", "DONE", "provider", "toss", "raw", res == null ? Map.of() : res);
      } catch (Exception e) {
        return Map.of("status", "DEMO_DONE", "provider", "demo",
            "message", "Toss confirm 실패 → 데모 승인 처리", "error", String.valueOf(e.getMessage()));
      }
    }
    return Map.of("status", "DEMO_DONE", "provider", "demo",
        "message", "유효한 Toss test secret key 미설정 → 데모 승인",
        "orderId", String.valueOf(r.orderId()), "amount", r.amount() == null ? 0 : r.amount());
  }
}
