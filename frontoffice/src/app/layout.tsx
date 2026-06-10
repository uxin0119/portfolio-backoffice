import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { Toaster, ConfirmHost } from "@/components/ui/feedback";
import { WakeBanner } from "@/components/ui/wake-banner";

export const metadata: Metadata = {
  title: "생활잡화 스토어",
  description: "포트폴리오 프론트오피스(소비자) — 백오피스와 공유 백엔드",
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    var dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <StoreHeader />
            <main className="flex-1">{children}</main>
            <StoreFooter />
          </CartProvider>
        </AuthProvider>
        <Toaster />
        <ConfirmHost />
        <WakeBanner />
      </body>
    </html>
  );
}
