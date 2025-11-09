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
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    
    // username이 변경되면 중복 체크 상태 초기화
    if (name === "username") {
      setUsernameChecked(false);
      setUsernameAvailable(false);
    }
  };

  const checkUsername = async () => {
    if (!formData.username) {
      setErrors((prev) => ({ ...prev, username: "아이디를 입력하세요" }));
      return;
    }

    if (formData.username.length < 4 || formData.username.length > 20) {
      setErrors((prev) => ({ ...prev, username: "아이디는 4자 이상 20자 이하여야 합니다" }));
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/check-username?username=${encodeURIComponent(formData.username)}`
      );
      const data = await response.json();
      
      setUsernameChecked(true);
      setUsernameAvailable(data.available);
      
      if (data.available) {
        toast.success("사용 가능한 아이디입니다");
        setErrors((prev) => ({ ...prev, username: "" }));
      } else {
        toast.error("이미 사용 중인 아이디입니다");
        setErrors((prev) => ({ ...prev, username: data.message }));
      }
    } catch {
      toast.error("아이디 중복 확인 중 오류가 발생했습니다");
    }
  };

  const validate = (): boolean => {
    const newErrors = { username: "", password: "", confirmPassword: "", name: "" };
    let isValid = true;

    if (!formData.username) {
      newErrors.username = "아이디는 필수입니다";
      isValid = false;
    } else if (formData.username.length < 4 || formData.username.length > 20) {
      newErrors.username = "아이디는 4자 이상 20자 이하여야 합니다";
      isValid = false;
    } else if (!usernameChecked || !usernameAvailable) {
      newErrors.username = "아이디 중복 확인을 해주세요";
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
          email: `${formData.username}@codebrainer.local`,
          username: formData.username,
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
    } catch {
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
            회원가입
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            CodeBrainer에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <div className="flex gap-2">
                <Input id="username" name="username" type="text" placeholder="4-20자 영문/숫자"
                  value={formData.username} onChange={handleChange} disabled={isLoading}
                  className={errors.username ? "border-red-500" : usernameChecked && usernameAvailable ? "border-green-500" : ""} />
                <Button type="button" variant="outline" onClick={checkUsername} disabled={isLoading || !formData.username}>
                  중복확인
                </Button>
              </div>
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              {usernameChecked && usernameAvailable && <p className="text-sm text-green-600">✓ 사용 가능한 아이디입니다</p>}
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


