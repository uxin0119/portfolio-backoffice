package com.uxin.backoffice.auth;

import com.uxin.backoffice.member.Member;
import com.uxin.backoffice.member.MemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** 러프 인증: BCrypt 검증 후 데모 토큰("m_{id}") 반환. 데이터 API는 여전히 permitAll. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final MemberRepository repo;
  private final PasswordEncoder encoder;

  public AuthController(MemberRepository repo, PasswordEncoder encoder) {
    this.repo = repo;
    this.encoder = encoder;
  }

  public record SignupReq(String loginId, String password, String name) {}

  public record LoginReq(String loginId, String password) {}

  public record AuthRes(Long id, String loginId, String name, String token) {}

  @PostMapping("/signup")
  public AuthRes signup(@RequestBody SignupReq r) {
    if (r.loginId() == null || r.loginId().isBlank() || r.password() == null || r.password().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "아이디/비밀번호 필수");
    }
    if (repo.existsByLoginId(r.loginId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 아이디입니다");
    }
    Member m = new Member();
    m.setLoginId(r.loginId());
    m.setPasswordHash(encoder.encode(r.password()));
    m.setName(r.name() != null && !r.name().isBlank() ? r.name() : r.loginId());
    repo.save(m);
    return new AuthRes(m.getId(), m.getLoginId(), m.getName(), "m_" + m.getId());
  }

  @PostMapping("/login")
  public AuthRes login(@RequestBody LoginReq r) {
    Member m = repo.findByLoginId(r.loginId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "존재하지 않는 계정"));
    if (!encoder.matches(r.password(), m.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다");
    }
    return new AuthRes(m.getId(), m.getLoginId(), m.getName(), "m_" + m.getId());
  }
}
