"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ActivityHeatmap from "./ActivityHeatmap";
import AlgorithmStats from "./AlgorithmStats";
import AIRecommendations from "./AIRecommendations";
import ProblemItem from "./ProblemItem";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DashboardTabProps {
  userInfo: any;
  overall: any;
  charts: any;
  recentItems: any[];
  items: any[];
  list: any;
  page: number;
  setPage: (page: number) => void;
  userId: number;
}

export function DashboardTab({
  userInfo,
  overall,
  charts,
  recentItems,
  items,
  list,
  page,
  setPage,
  userId,
}: DashboardTabProps) {
  return (
    <div>
      {/* 프로필 정보 & 통계 */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>👤 프로필 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl">
                👤
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  {userInfo?.name || userInfo?.email || "사용자"}
                </h2>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-slate-700">풀이 수:</span>{" "}
                    {overall?.solvedProblems ?? 0}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">정답률:</span>{" "}
                    {overall ? (overall.acRate * 100).toFixed(1) : 0}%
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">도전 문제:</span>{" "}
                    {overall?.attemptedProblems ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 활동 그래프 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">📊 활동 그래프</h2>
        <ActivityHeatmap data={charts?.activityByDay ?? []} />
      </section>

      {/* 알고리즘별 통계 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">📈 알고리즘별 통계</h2>
        <AlgorithmStats data={charts} />
      </section>

      {/* AI 추천 복습 문제 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">🤖 AI 추천 복습 문제</h2>
        <AIRecommendations userId={userId} />
      </section>

      {/* 최근 해결한 문제 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">✅ 최근 해결한 문제</h2>
        <div className="grid grid-cols-1 gap-4">
          {recentItems.map((item, idx) => (
            <ProblemItem key={idx} item={item} userId={userId} />
          ))}
          {recentItems.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 푼 문제가 없어요.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      {/* 내가 푼 문제 전체 목록 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">📋 내가 푼 문제 전체 목록</h2>
          <div className="text-sm text-muted-foreground">
            총 {list?.totalPages ?? 0} 페이지
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, idx) => (
            <ProblemItem key={idx} item={item} userId={userId} />
          ))}
          {items.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 푼 문제가 없어요.
              </CardContent>
            </Card>
          )}
        </div>
        {list && list.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              이전
            </Button>
            <span className="flex items-center px-4 text-sm">
              {page + 1} / {list.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(list.totalPages - 1, page + 1))}
              disabled={page >= list.totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

