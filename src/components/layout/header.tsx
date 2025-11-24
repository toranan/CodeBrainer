"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ProblemHoverMenu } from "@/components/problem-hover-menu";

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        if (token && userJson) {
          setUser(JSON.parse(userJson));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("인증 확인 에러:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // storage 변경 감지 (다른 탭이나 창에서 변경 시)
    window.addEventListener("storage", checkAuth);

    // 커스텀 이벤트 감지 (같은 페이지 내에서 로그인/로그아웃 시)
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    toast.success("로그아웃되었습니다");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          CodeBrainer
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <ProblemHoverMenu />
          <Link href="/mock" className="hover:text-primary">모의고사</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-primary text-orange-600 font-semibold">
              관리자 콘솔
            </Link>
          )}
        </nav>
        {!isLoading && (
          <>
            {user ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link href="/me" className="hover:text-primary">마이페이지</Link>
                <span className="font-medium text-slate-700">{user.name || user.email}</span>
                <button onClick={handleLogout} className="text-primary hover:underline">
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {pathname === "/auth/signin" ? (
                  <Link href="/auth/signup" className="hover:text-primary">회원가입</Link>
                ) : pathname === "/auth/signup" ? (
                  <Link href="/auth/signin" className="hover:text-primary">로그인</Link>
                ) : (
                  <>
                    <Link href="/auth/signup" className="hover:text-primary">회원가입</Link>
                    <Link href="/auth/signin" className="hover:text-primary">로그인</Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}


