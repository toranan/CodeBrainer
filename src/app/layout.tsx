import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ReactNode } from "react";

import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";
// import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeBrainer",
    template: "%s | CodeBrainer",
  },
  description:
    "알고리즘 문제 풀이, 모의고사, AI 코드 리뷰까지 제공하는 프로그래밍 학습 플랫폼",
};

async function AppShell({ children }: { children: ReactNode }) {
  // const session = await auth();
  // const session: { user?: { name?: string; email?: string } } | null = null; // DB 없이 실행하기 위한 임시 처리

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-primary">
            CodeBrainer
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/problems" className="hover:text-primary">
              문제 목록
            </Link>
            <Link href="/mock" className="hover:text-primary">
              모의고사
            </Link>
            <Link href="/admin" className="hover:text-primary">
              관리자 콘솔
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/auth/signin" className="hover:text-primary">
              로그인
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {children}
      </main>
      <footer className="border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} CodeBrainer. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-primary">
              소개
            </Link>
            <Link href="/terms" className="hover:text-primary">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
