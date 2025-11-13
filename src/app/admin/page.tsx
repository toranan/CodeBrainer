"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              총 사용자 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-slate-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              총 문제 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-slate-500">+3 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              오늘 제출 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-slate-500">+23% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              활성 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-slate-500">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* 인기 문제 & 최근 활동 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🔥 인기 문제 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">문제 제목 {i}</p>
                    <p className="text-sm text-slate-500">난이도: Gold {i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">{120 - i * 10}회</p>
                    <p className="text-xs text-slate-500">제출</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "user1", action: "문제를 풀었습니다", time: "2분 전" },
                { user: "user2", action: "회원가입했습니다", time: "5분 전" },
                { user: "user3", action: "문제를 풀었습니다", time: "10분 전" },
                { user: "user4", action: "문제를 풀었습니다", time: "15분 전" },
                { user: "user5", action: "회원가입했습니다", time: "20분 전" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-slate-500">{activity.action}</p>
                  </div>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

