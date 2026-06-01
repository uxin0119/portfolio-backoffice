package com.uxin.backoffice.customer;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

  private final CustomerRepository repo;

  public CustomerController(CustomerRepository repo) {
    this.repo = repo;
  }

  public record CustomerReq(String name, String grade, String contact, String status) {}

  public record CustomerRes(
      Long id, String name, String grade, String contact, String status) {
    static CustomerRes of(Customer c) {
      return new CustomerRes(c.getId(), c.getName(), c.getGrade(), c.getContact(), c.getStatus());
    }
  }

  @GetMapping
  public List<CustomerRes> list(@RequestParam(required = false) String q) {
    var items = (q == null || q.isBlank())
        ? repo.findAll()
        : repo.findByNameContainingIgnoreCase(q);
    return items.stream().map(CustomerRes::of).toList();
  }

  @PostMapping
  public CustomerRes create(@RequestBody CustomerReq r) {
    Customer c = new Customer();
    apply(c, r);
    return CustomerRes.of(repo.save(c));
  }

  @PutMapping("/{id}")
  public CustomerRes update(@PathVariable Long id, @RequestBody CustomerReq r) {
    Customer c = repo.findById(id).orElseThrow();
    apply(c, r);
    return CustomerRes.of(repo.save(c));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }

  private void apply(Customer c, CustomerReq r) {
    if (r.name() != null) c.setName(r.name());
    if (r.grade() != null) c.setGrade(r.grade());
    c.setContact(r.contact());
    if (r.status() != null) c.setStatus(r.status());
  }
}
