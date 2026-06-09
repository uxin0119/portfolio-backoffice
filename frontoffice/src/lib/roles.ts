export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "슈퍼관리자",
  ADMIN: "관리자",
  SELLER: "판매자",
  BUYER: "구매자",
};

/** 백오피스(관리자/판매자) 접근 가능 역할 */
export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SELLER"];

export const isStaff = (role?: string | null) => !!role && STAFF_ROLES.includes(role);
