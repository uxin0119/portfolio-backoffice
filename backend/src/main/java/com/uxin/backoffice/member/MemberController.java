package com.uxin.backoffice.member;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** 회원 관리/마이페이지 — 목록·조회·연락처주소 수정·삭제. 생성은 /api/auth/signup 재사용. */
@RestController
@RequestMapping("/api/members")
public class MemberController {

  private final MemberRepository repo;

  public MemberController(MemberRepository repo) {
    this.repo = repo;
  }

  static final java.util.Set<String> ROLES = java.util.Set.of("SUPER_ADMIN", "ADMIN", "SELLER", "BUYER");

  public record MemberRes(
      Long id, String loginId, String name, String createdAt, String role,
      String email, String phone, String postcode, String address, String addressDetail) {
    static MemberRes of(Member m) {
      return new MemberRes(
          m.getId(), m.getLoginId(), m.getName(),
          m.getCreatedAt() == null ? null : m.getCreatedAt().toString(), m.getRole(),
          m.getEmail(), m.getPhone(), m.getPostcode(), m.getAddress(), m.getAddressDetail());
    }
  }

  /** 마이페이지 프로필 수정 — 연락처/주소만(아이디·비밀번호·이름 제외). */
  public record UpdateReq(String email, String phone, String postcode, String address, String addressDetail) {}

  /** 역할 변경(백오피스 관리자용). */
  public record RoleReq(String role) {}

  private static String trimToNull(String s) {
    return (s == null || s.isBlank()) ? null : s.trim();
  }

  @GetMapping
  public List<MemberRes> list() {
    return repo.findAll().stream()
        .sorted((a, b) -> b.getId().compareTo(a.getId()))
        .map(MemberRes::of)
        .toList();
  }

  @GetMapping("/{id}")
  public MemberRes get(@PathVariable Long id) {
    return MemberRes.of(repo.findById(id).orElseThrow());
  }

  @PatchMapping("/{id}")
  public MemberRes update(@PathVariable Long id, @RequestBody UpdateReq r) {
    Member m = repo.findById(id).orElseThrow();
    String email = trimToNull(r.email());
    if (email != null && !email.equals(m.getEmail()) && repo.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다");
    }
    m.setEmail(email);
    m.setPhone(trimToNull(r.phone()));
    m.setPostcode(trimToNull(r.postcode()));
    m.setAddress(trimToNull(r.address()));
    m.setAddressDetail(trimToNull(r.addressDetail()));
    repo.save(m);
    return MemberRes.of(m);
  }

  @PatchMapping("/{id}/role")
  public MemberRes updateRole(@PathVariable Long id, @RequestBody RoleReq r) {
    if (r.role() == null || !ROLES.contains(r.role())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 역할");
    }
    Member m = repo.findById(id).orElseThrow();
    m.setRole(r.role());
    repo.save(m);
    return MemberRes.of(m);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }
}
