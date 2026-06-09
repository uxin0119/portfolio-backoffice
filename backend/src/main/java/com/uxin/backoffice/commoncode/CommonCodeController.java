package com.uxin.backoffice.commoncode;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** 공통코드 관리 — 조회/등록/수정/삭제. */
@RestController
@RequestMapping("/api/codes")
public class CommonCodeController {

  private final CommonCodeRepository repo;

  public CommonCodeController(CommonCodeRepository repo) {
    this.repo = repo;
  }

  public record CodeRes(Long id, String groupCode, String code, String name, int sortOrder, boolean active) {
    static CodeRes of(CommonCode c) {
      return new CodeRes(c.getId(), c.getGroupCode(), c.getCode(), c.getName(), c.getSortOrder(), c.isActive());
    }
  }

  public record CreateReq(String groupCode, String code, String name, Integer sortOrder, Boolean active) {}

  public record UpdateReq(String name, Integer sortOrder, Boolean active) {}

  @GetMapping
  public List<CodeRes> list() {
    return repo.findAllByOrderByGroupCodeAscSortOrderAscIdAsc().stream().map(CodeRes::of).toList();
  }

  @PostMapping
  public CodeRes create(@RequestBody CreateReq r) {
    String group = trim(r.groupCode());
    String code = trim(r.code());
    String name = trim(r.name());
    if (group == null || code == null || name == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "그룹/코드/코드명은 필수입니다");
    }
    if (repo.existsByGroupCodeAndCode(group, code)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 그룹+코드입니다");
    }
    CommonCode c = new CommonCode();
    c.setGroupCode(group);
    c.setCode(code);
    c.setName(name);
    c.setSortOrder(r.sortOrder() == null ? 0 : r.sortOrder());
    c.setActive(r.active() == null || r.active());
    return CodeRes.of(repo.save(c));
  }

  @PutMapping("/{id}")
  public CodeRes update(@PathVariable Long id, @RequestBody UpdateReq r) {
    CommonCode c = repo.findById(id).orElseThrow();
    if (r.name() != null && !r.name().isBlank()) c.setName(r.name().trim());
    if (r.sortOrder() != null) c.setSortOrder(r.sortOrder());
    if (r.active() != null) c.setActive(r.active());
    return CodeRes.of(repo.save(c));
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }

  private static String trim(String s) {
    return (s == null || s.isBlank()) ? null : s.trim();
  }
}
