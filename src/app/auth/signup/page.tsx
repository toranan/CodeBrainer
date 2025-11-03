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

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors = { email: "", password: "", confirmPassword: "", name: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "이메일은 필수입니다";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "비밀번호는 필수입니다";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인은 필수입니다";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
      isValid = false;
    }

    if (!formData.name) {
      newErrors.name = "이름은 필수입니다";
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
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors((prev) => ({ ...prev, email: data.message }));
          toast.error(data.message);
        } else {
          toast.error(data.message || "회원가입 중 오류가 발생했습니다");
        }
        return;
      }

      toast.success("회원가입이 완료되었습니다!");
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
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
            CodeBrainer 회원가입
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            계정을 만들고 프로그래밍 학습을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com"
                value={formData.email} onChange={handleChange} disabled={isLoading}
                className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" name="name" type="text" placeholder="홍길동"
                value={formData.name} onChange={handleChange} disabled={isLoading}
                className={errors.name ? "border-red-500" : ""} />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" placeholder="최소 8자 이상"
                value={formData.password} onChange={handleChange} disabled={isLoading}
                className={errors.password ? "border-red-500" : ""} />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password"
                placeholder="비밀번호를 다시 입력하세요" value={formData.confirmPassword}
                onChange={handleChange} disabled={isLoading}
                className={errors.confirmPassword ? "border-red-500" : ""} />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "처리 중..." : "회원가입"}
            </Button>

            <div className="pt-2 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


