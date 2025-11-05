"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCharts, getMyProblems, getReview } from "@/server/mypage-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// 로그인 연동 전 임시: 데모 사용자 ID
const DEMO_USER_ID = 1;

export default function MyPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const { data: list } = useQuery({
    queryKey: ["me/problems", DEMO_USER_ID, page, size],
    queryFn: () => getMyProblems({ userId: DEMO_USER_ID, status: "AC", page, size }),
  });

  const { data: charts } = useQuery({
    queryKey: ["me/charts", DEMO_USER_ID],
    queryFn: () => getCharts({ userId: DEMO_USER_ID, days: 30 }),
  });

  const items = list?.content ?? [];

  const overall = charts?.overall;
  const recentItems = items.slice(0, 3); // 최근 3개만

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">마이페이지</h1>

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
                <h2 className="text-xl font-semibold mb-2">사용자 #{DEMO_USER_ID}</h2>
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
        <AIRecommendations userId={DEMO_USER_ID} />
      </section>

      {/* 최근 해결한 문제 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">✅ 최근 해결한 문제</h2>
        <div className="grid grid-cols-1 gap-4">
          {recentItems.map((item, idx) => (
            <ProblemItem key={idx} item={item} />
          ))}
          {recentItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 푼 문제가 없어요.
              </CardContent>
            </Card>
          ) : null}
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
            <ProblemItem key={idx} item={item} />
          ))}
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 푼 문제가 없어요.
              </CardContent>
            </Card>
          ) : null}
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
            <span className="flex items-center px-4 text-sm text-muted-foreground">
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

function ProblemItem({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<any | null>(null);

  const load = async () => {
    const res = await getReview({ userId: DEMO_USER_ID, baseProblemId: item.problem.id, limit: 3 });
    setReview(res);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{item.problem.title}</CardTitle>
        <Button size="sm" onClick={load}>
          복습하기
        </Button>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-3">
          <span>티어: {item.problem.tier}</span>
          <span>레벨: {item.problem.level}</span>
          <span>카테고리: {item.problem.categories?.join(", ")}</span>
          <span>최근 제출: {item.lastSubmission?.status} / {item.lastSubmission?.lang}</span>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>추천 문제</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {review?.recommendations?.length ? (
              review.recommendations.map((p: any) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-muted-foreground">{p.tier} · {p.level} · {(p.categories ?? []).join(", ")}</div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">추천 결과가 없습니다.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// 활동 히트맵 (GitHub 스타일)
function ActivityHeatmap({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 30일 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {data.map((d: any, idx: number) => {
            const intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 5 ? 2 : 3;
            const colors = [
              "bg-slate-100",
              "bg-green-200",
              "bg-green-400",
              "bg-green-600"
            ];
            return (
              <div
                key={idx}
                className={`h-8 rounded ${colors[intensity]} flex items-center justify-center text-xs`}
                title={`${d.date}: ${d.count}개`}
              >
                {d.count > 0 ? d.count : ""}
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            활동 데이터가 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 알고리즘별 통계
function AlgorithmStats({ data }: { data: any }) {
  const categories = data?.solvedCountByCategory ?? [];
  const levels = data?.solvedCountByLevel ?? [];
  const langs = data?.languageUsage ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">카테고리별 해결 수</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 max-h-64 overflow-auto">
          {categories.map((c: any) => (
            <div key={c.category} className="flex items-center justify-between">
              <span className="font-medium">{c.category}</span>
              <span className="text-primary font-semibold">{c.count}</span>
            </div>
          ))}
          {categories.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">난이도별 해결 수</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {levels.map((l: any) => (
            <div key={l.level} className="flex items-center justify-between">
              <span className="font-medium">Level {l.level}</span>
              <span className="text-primary font-semibold">{l.count}</span>
            </div>
          ))}
          {levels.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용 언어</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {langs.map((l: any) => (
            <div key={l.lang} className="flex items-center justify-between">
              <span className="font-medium">{l.lang}</span>
              <span className="text-primary font-semibold">{l.count}</span>
            </div>
          ))}
          {langs.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>
    </div>
  );
}

// AI 추천 복습 문제
function AIRecommendations({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // 여러 문제에 대해 복습 추천을 받아옴
      const res = await getReview({ userId, baseProblemId: 1, limit: 5 });
      setRecommendations(res?.recommendations ?? []);
    } catch (error) {
      console.error("복습 추천 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">🧠 맞춤형 복습 문제</CardTitle>
        <Button size="sm" onClick={loadRecommendations} disabled={loading}>
          {loading ? "로딩 중..." : "새로고침"}
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((p: any) => (
              <div
                key={p.id}
                className="rounded-lg border p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-900 mb-1">{p.title}</div>
                <div className="text-sm text-muted-foreground">
                  {p.tier} · Level {p.level} · {(p.categories ?? []).join(", ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            새로고침 버튼을 눌러 AI 추천 문제를 불러오세요
          </div>
        )}
      </CardContent>
    </Card>
  );
}


