import {
  IconDashboard,
  IconProduct,
  IconCustomer,
  IconOrder,
  IconInventory,
  IconSettings,
} from "@/components/icons";

export const NAV = [
  { href: "/", label: "대시보드", Icon: IconDashboard },
  { href: "/products", label: "상품", Icon: IconProduct },
  { href: "/customers", label: "거래처", Icon: IconCustomer },
  { href: "/orders", label: "주문", Icon: IconOrder },
  { href: "/inventory", label: "재고", Icon: IconInventory },
  { href: "/members", label: "회원", Icon: IconCustomer },
  { href: "/settings", label: "설정", Icon: IconSettings },
] as const;
