"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ActivityHeatmap from "./ActivityHeatmap";
import AlgorithmStats from "./AlgorithmStats";
import HintUsageTrends from "./HintUsageTrends";
import AIRecommendations from "./AIRecommendations";
import ProblemItem from "./ProblemItem";
// import { GrowthGraph } from "./GrowthGraph"; // TODO: GrowthGraph 컴포넌트 생성 필요

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DashboardTabProps {
  userInfo: any;
  overall: any;
  charts: any;
  hintTrends: any;
  hintDays: 7 | 30 | 90 | 365;
  onChangeHintDays: (days: 7 | 30 | 90 | 365) => void;
  recentItems: any[];
  items: any[];
  list: any;
  attemptedList?: any;
  page: number;
  setPage: (page: number) => void;
  userId: string;
}

export function DashboardTab({
  userInfo,
  overall,
  charts,
  hintTrends,
  hintDays,
  onChangeHintDays,
  recentItems,
  items,
  list,
  attemptedList,
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
                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
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
                  <div>
                    <span className="font-medium text-slate-700">이번 주 정답:</span>{" "}
                    {overall?.solvedLast7Days ?? "0"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">이번 달 정답:</span>{" "}
                    {overall?.solvedLast30Days ?? "0"}
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

      {/* 힌트 사용량 트렌드 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">💡 힌트 사용량 변화</h2>
        <HintUsageTrends
          data={hintTrends}
          days={hintDays}
          onChangeDays={onChangeHintDays}
          userId={userId}
        />
      </section>

      {/* 성장 그래프 */}
      {/* TODO: GrowthGraph 컴포넌트 생성 후 활성화 */}

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

      {/* 시도한 문제 전체 목록 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">📋 시도한 문제 전체 목록</h2>
          <div className="text-sm text-muted-foreground">
            총 {attemptedList?.totalPages ?? 0} 페이지
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {(attemptedList?.content ?? []).map((item: any, idx: number) => (
            <ProblemItem key={idx} item={item} userId={userId} />
          ))}
          {(attemptedList?.content ?? []).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 시도한 문제가 없어요.
              </CardContent>
            </Card>
          )}
        </div>
        {attemptedList && attemptedList.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              이전
            </Button>
            <span className="flex items-center px-4 text-sm">
              {page + 1} / {attemptedList.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(attemptedList.totalPages - 1, page + 1))}
              disabled={page >= attemptedList.totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

