"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const adminMenus = [
  { href: "/admin", label: "📊 대시보드" },
  { href: "/admin/problems", label: "📝 문제 관리" },
  { href: "/admin/users", label: "👥 사용자 관리" },
  { href: "/admin/submissions", label: "📋 제출 내역" },
  { href: "/admin/announcements", label: "📢 공지사항" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 관리자 서브 네비게이션 */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex gap-1">
            {adminMenus.map((menu) => {
              const isActive = pathname === menu.href;
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`
                    px-4 py-3 text-sm font-medium transition-colors
                    border-b-2 hover:text-orange-600
                    ${
                      isActive
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-slate-600"
                    }
                  `}
                >
                  {menu.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 페이지 내용 */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

