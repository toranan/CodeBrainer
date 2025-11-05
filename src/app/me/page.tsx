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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">마이페이지</h1>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 푼 문제</h2>
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
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="mb-3 text-lg font-semibold">학습 데이터 시각화</h2>
        <ChartsSection data={charts} />
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

function ChartsSection({ data }: { data: any }) {
  const overall = data?.overall;
  const activity = data?.activityByDay ?? [];
  const solvedByTier = data?.solvedCountByTier ?? [];
  const lang = data?.languageUsage ?? [];

  // 간단한 텍스트 프리뷰(차트 라이브러리 없이 최소 구현)
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 활동 (일별)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1 max-h-56 overflow-auto">
          {activity.map((d: any) => (
            <div key={d.date} className="flex justify-between"><span>{d.date}</span><span>{d.count}</span></div>
          ))}
          {activity.length === 0 ? <div>데이터 없음</div> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">티어별 해결 수</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          {solvedByTier.map((t: any) => (
            <div key={t.tier} className="flex justify-between"><span>{t.tier}</span><span>{t.count}</span></div>
          ))}
          {solvedByTier.length === 0 ? <div>데이터 없음</div> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">언어 비율</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          {lang.map((l: any) => (
            <div key={l.lang} className="flex justify-between"><span>{l.lang}</span><span>{l.count}</span></div>
          ))}
          {lang.length === 0 ? <div>데이터 없음</div> : null}
        </CardContent>
      </Card>
      {overall ? (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">전체 요약</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex gap-6">
            <div>도전 문제: {overall.attemptedProblems}</div>
            <div>정답 문제: {overall.solvedProblems}</div>
            <div>정답률: {(overall.acRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}


