package com.uxin.backoffice.member;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 백오피스 회원 관리 — 목록/삭제. 생성은 /api/auth/signup 재사용. */
@RestController
@RequestMapping("/api/members")
public class MemberController {

  private final MemberRepository repo;

  public MemberController(MemberRepository repo) {
    this.repo = repo;
  }

  public record MemberRes(Long id, String loginId, String name, String createdAt) {}

  @GetMapping
  public List<MemberRes> list() {
    return repo.findAll().stream()
        .sorted((a, b) -> b.getId().compareTo(a.getId()))
        .map(m -> new MemberRes(
            m.getId(), m.getLoginId(), m.getName(),
            m.getCreatedAt() == null ? null : m.getCreatedAt().toString()))
        .toList();
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }
}
