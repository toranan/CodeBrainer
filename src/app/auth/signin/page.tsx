"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupBanner, setShowSignupBanner] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    emailOrUsername: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setShowSignupBanner(false);
  };

  const validate = (): boolean => {
    const newErrors = { emailOrUsername: "", password: "" };
    let isValid = true;

    if (!formData.emailOrUsername) {
      newErrors.emailOrUsername = "아이디는 필수입니다";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "비밀번호는 필수입니다";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setShowSignupBanner(true);
          setErrors({ emailOrUsername: " ", password: "아이디 또는 비밀번호가 올바르지 않습니다" });
        } else {
          toast.error(data.message || "로그인 중 오류가 발생했습니다");
        }
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        userId: String(data.userId),
        email: data.email,
        name: data.name,
        role: data.role,
      }));

      // 헤더에 로그인 상태 변경 알림
      window.dispatchEvent(new Event("authChange"));

      toast.success("로그인 성공!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("로그인 에러:", error);
      toast.error("서버와 통신 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            로그인
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            아이디로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignupBanner && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-orange-900">회원정보가 없습니다</p>
                  <p className="text-sm text-orange-700 mt-1">
                    입력하신 정보와 일치하는 계정을 찾을 수 없습니다
                  </p>
                </div>
                <Link href="/auth/signup">
                  <Button
                    type="button"
                    className="ml-4 bg-orange-600 hover:bg-orange-700"
                  >
                    회원가입하기
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">아이디</Label>
              <Input id="emailOrUsername" name="emailOrUsername" type="text" placeholder="아이디를 입력하세요"
                value={formData.emailOrUsername} onChange={handleChange} disabled={isLoading}
                className={errors.emailOrUsername ? "border-red-500" : ""} />
              {errors.emailOrUsername && <p className="text-sm text-red-500">{errors.emailOrUsername}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" placeholder="비밀번호를 입력하세요"
                value={formData.password} onChange={handleChange} disabled={isLoading}
                className={errors.password ? "border-red-500" : ""} />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                회원가입
              </Link>
            </div>

            <div className="pt-2 text-center text-sm text-muted-foreground">
              <Link href="/" className="text-primary hover:underline">
                메인으로 돌아가기
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

