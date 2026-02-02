import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Stock Dashboard - 주식 웹 포털 대시보드",
  description:
    "국내외 주식, 암호화폐, 귀금속, 환율, 시장지수, 뉴스를 한눈에 확인하는 통합 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
