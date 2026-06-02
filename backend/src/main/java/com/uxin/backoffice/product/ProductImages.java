package com.uxin.backoffice.product;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** 상품명을 프롬프트로 한 AI 상품 이미지 URL 생성 (Pollinations, API 키 불필요). */
public final class ProductImages {

  private ProductImages() {}

  public static String imageFor(String name, long seed) {
    String prompt = (name == null || name.isBlank() ? "product" : name)
        + " product photo, white background, studio lighting, ecommerce";
    return "https://image.pollinations.ai/prompt/"
        + URLEncoder.encode(prompt, StandardCharsets.UTF_8)
        + "?width=400&height=400&nologo=true&seed=" + Math.abs(seed);
  }
}
