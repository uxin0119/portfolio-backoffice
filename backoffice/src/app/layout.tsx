import type { Metadata } from "next";
import "./globals.css";
import { Toaster, ConfirmHost } from "@/components/ui/feedback";
import { WakeBanner } from "@/components/ui/wake-banner";

export const metadata: Metadata = {
  title: "포트폴리오 백오피스",
  description: "소규모 B2C 소매 셀러용 관리자 백오피스",
};

// 다크모드 FOUC 방지: 페인트 전에 저장된 테마를 <html>에 적용
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
      <body className="min-h-full antialiased">
        {children}
        <Toaster />
        <ConfirmHost />
        <WakeBanner />
      </body>
    </html>
  );
}
