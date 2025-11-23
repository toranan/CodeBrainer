"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCharts, getMyProblems } from "@/server/mypage-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 탭 컴포넌트들
import { DashboardTab } from "./dashboard-tab";
import { ProfileTab } from "./profile-tab";
import { GoalsTab } from "./goals-tab";
import { ReviewTab } from "./review-tab";

interface UserInfo {
  userId: number;
  email: string;
  name: string;
  role: string;
  username?: string;
}

export default function MyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [page, setPage] = useState(0);
  const size = 10;

  // 로그인 체크
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      router.push("/auth/signin");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      setUserId(user.userId);
      setUserInfo(user);
    } catch {
      router.push("/auth/signin");
    }
  }, [router]);

  const { data: list } = useQuery({
    queryKey: ["me/problems", userId, page, size],
    queryFn: () => getMyProblems({ userId: userId!, status: "AC", page, size }),
    enabled: userId !== null,
  });

  const { data: charts } = useQuery({
    queryKey: ["me/charts", userId],
    queryFn: () => getCharts({ userId: userId!, days: 30 }),
    enabled: userId !== null,
  });

  const items = list?.content ?? [];
  const overall = charts?.overall;
  const recentItems = items.slice(0, 3);

  // 로그인 확인 중
  if (userId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로그인 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">마이페이지</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="profile">프로필 편집</TabsTrigger>
          <TabsTrigger value="goals">학습 목표</TabsTrigger>
          <TabsTrigger value="review">복습 노트</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab
            userInfo={userInfo}
            overall={overall}
            charts={charts}
            recentItems={recentItems}
            items={items}
            list={list}
            page={page}
            setPage={setPage}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab userInfo={userInfo} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <GoalsTab />
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <ReviewTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

