package com.uxin.backoffice.config;

import com.uxin.backoffice.customer.Customer;
import com.uxin.backoffice.customer.CustomerRepository;
import com.uxin.backoffice.member.Member;
import com.uxin.backoffice.member.MemberRepository;
import com.uxin.backoffice.order.OrderService;
import com.uxin.backoffice.product.Product;
import com.uxin.backoffice.product.ProductImages;
import com.uxin.backoffice.product.ProductRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** local 프로파일에서만 동작하는 데모 시드. 이미 데이터가 있으면 건너뜀. */
@Component
@Profile("local")
public class DevSeeder implements CommandLineRunner {

  private final ProductRepository productRepo;
  private final CustomerRepository customerRepo;
  private final OrderService orderService;
  private final MemberRepository memberRepo;
  private final PasswordEncoder encoder;

  public DevSeeder(
      ProductRepository productRepo, CustomerRepository customerRepo, OrderService orderService,
      MemberRepository memberRepo, PasswordEncoder encoder) {
    this.productRepo = productRepo;
    this.customerRepo = customerRepo;
    this.orderService = orderService;
    this.memberRepo = memberRepo;
    this.encoder = encoder;
  }

  @Override
  public void run(String... args) {
    seedMembers(); // 상품 유무와 무관하게 계정 시드 (우회계정 test/1 포함)
    backfillProductImages(); // image_url 비어있는 기존 상품에 AI 이미지 URL 백필

    if (productRepo.count() > 0) return;

    Product p1 = product("SKU-1042", "친환경 수세미 3입", "주방", 3500, 4, 20);
    Product p2 = product("SKU-2210", "스테인리스 빨대 세트", "주방", 8900, 7, 15);
    Product p3 = product("SKU-0087", "면 행주 10매", "청소", 6500, 2, 30);
    Product p4 = product("SKU-3301", "다용도 보관용기 5종", "주방", 12000, 80, 20);
    Product p5 = product("SKU-4410", "천연 주방세제 1L", "세제", 5200, 120, 40);
    productRepo.saveAll(List.of(p1, p2, p3, p4, p5));

    Customer c1 = customer("김민수", "VIP", "010-1111-2222");
    Customer c2 = customer("이서연", "우수", "010-3333-4444");
    Customer c3 = customer("박지훈", "일반", "010-5555-6666");
    customerRepo.saveAll(List.of(c1, c2, c3));

    orderService.create(c1.getId(),
        List.of(new OrderService.ItemReq(p4.getId(), 3), new OrderService.ItemReq(p5.getId(), 2)));
    orderService.create(c2.getId(),
        List.of(new OrderService.ItemReq(p2.getId(), 1)));
    orderService.create(c3.getId(),
        List.of(new OrderService.ItemReq(p5.getId(), 5)));
  }

  private Product product(String sku, String name, String cat, int price, int stock, int safety) {
    Product p = new Product();
    p.setSku(sku);
    p.setName(name);
    p.setCategory(cat);
    p.setBasePrice(price);
    p.setStockQty(stock);
    p.setSafetyStock(safety);
    p.setStatus("ACTIVE");
    p.setImageUrl(ProductImages.imageFor(name, sku.hashCode()));
    return p;
  }

  private void backfillProductImages() {
    List<Product> toUpdate = new ArrayList<>();
    for (Product p : productRepo.findAll()) {
      if (p.getImageUrl() == null || p.getImageUrl().isBlank()) {
        p.setImageUrl(ProductImages.imageFor(p.getName(), p.getSku() == null ? 0 : p.getSku().hashCode()));
        toUpdate.add(p);
      }
    }
    if (!toUpdate.isEmpty()) productRepo.saveAll(toUpdate);
  }

  private Customer customer(String name, String grade, String contact) {
    Customer c = new Customer();
    c.setName(name);
    c.setGrade(grade);
    c.setContact(contact);
    c.setStatus("ACTIVE");
    return c;
  }

  private void seedMembers() {
    if (memberRepo.count() > 0) return;
    member("test", "1", "테스트");   // 로그인 우회용 계정 (id: test / pw: 1)
    member("admin", "admin", "운영자");
  }

  private void member(String loginId, String password, String name) {
    Member m = new Member();
    m.setLoginId(loginId);
    m.setPasswordHash(encoder.encode(password));
    m.setName(name);
    memberRepo.save(m);
  }
}
