export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "슈퍼관리자",
  ADMIN: "관리자",
  SELLER: "판매자",
  BUYER: "구매자",
};

export const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN", "SELLER", "BUYER"] as const;

/** 백오피스 접근 가능 역할(구매자는 차단) */
export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SELLER"];

export const isStaff = (role?: string | null) => !!role && STAFF_ROLES.includes(role);

/** 현재 로그인한 백오피스 사용자의 역할(localStorage bo_auth). 없으면 null. */
export function currentRole(): string | null {
  try {
    const raw = localStorage.getItem("bo_auth");
    if (!raw) return null;
    return (JSON.parse(raw) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}
