import {
  IconDashboard,
  IconProduct,
  IconCustomer,
  IconOrder,
  IconInventory,
  IconSettings,
  IconCode,
} from "@/components/icons";

// roles: 해당 메뉴를 볼 수 있는 역할. 운영 공통은 셋 다, 회원/설정은 상위 역할만.
const STAFF = ["SUPER_ADMIN", "ADMIN", "SELLER"];

export const NAV = [
  { href: "/", label: "대시보드", Icon: IconDashboard, roles: STAFF },
  { href: "/products", label: "상품", Icon: IconProduct, roles: STAFF },
  { href: "/customers", label: "거래처", Icon: IconCustomer, roles: STAFF },
  { href: "/orders", label: "주문", Icon: IconOrder, roles: STAFF },
  { href: "/inventory", label: "재고", Icon: IconInventory, roles: STAFF },
  { href: "/members", label: "회원", Icon: IconCustomer, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/codes", label: "공통코드", Icon: IconCode, roles: ["SUPER_ADMIN"] },
  { href: "/settings", label: "설정", Icon: IconSettings, roles: ["SUPER_ADMIN"] },
] as const;
