"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ProfileTabProps {
  userInfo: any;
}

export function ProfileTab({ userInfo }: ProfileTabProps) {
  const [name, setName] = useState(userInfo?.name || "");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("로그인이 필요합니다");
        return;
      }

      const response = await fetch("http://localhost:8081/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      if (!response.ok) {
        throw new Error("프로필 업데이트 실패");
      }

      // localStorage의 user 정보도 업데이트
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        user.name = name;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("프로필이 업데이트되었습니다");
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      toast.error("프로필 업데이트에 실패했습니다");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("로그인이 필요합니다");
        return;
      }

      const response = await fetch("http://localhost:8081/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "비밀번호 변경에 실패했습니다");
        return;
      }

      toast.success("비밀번호가 변경되었습니다");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      toast.error("비밀번호 변경에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      {/* 프로필 정보 편집 */}
      <Card>
        <CardHeader>
          <CardTitle>👤 프로필 정보 편집</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                value={userInfo?.username || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">아이디는 변경할 수 없습니다</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={userInfo?.email || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">이메일은 변경할 수 없습니다</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자기소개를 입력하세요"
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              프로필 저장
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (8자 이상)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>

            <Button type="submit" className="w-full" variant="outline">
              비밀번호 변경
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

