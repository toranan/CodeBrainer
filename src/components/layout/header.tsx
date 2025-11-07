"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  userId: number;
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
        }
      } catch (error) {
        console.error("인증 확인 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("로그아웃되었습니다");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primary">
          CodeBrainer
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/problems" className="hover:text-primary">문제 목록</Link>
          <Link href="/mock" className="hover:text-primary">모의고사</Link>
          <Link href="/admin" className="hover:text-primary">관리자 콘솔</Link>
        </nav>
        {!isLoading && (
          <>
            {user ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-slate-700">{user.name || user.email}</span>
                <button onClick={handleLogout} className="text-primary hover:underline">
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link href="/mypage" className="hover:text-primary">마이페이지</Link>
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


