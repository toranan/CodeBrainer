"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getReview } from "@/server/mypage-client";

export default function ProblemItem({ item, userId }: { item: any; userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<any | null>(null);

  const handleReview = () => {
    // 문제 페이지로 이동
    if (item.problem?.slug) {
      router.push(`/problems/${item.problem.slug}`);
    }
  };

  const load = async () => {
    const res = await getReview({ userId, baseProblemId: item.problem.id, limit: 3 });
    setReview(res);
    setOpen(true);
  };

  const lastSubmissionTime = item.lastSubmission?.createdAt
    ? new Date(item.lastSubmission.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "기록 없음";

  const lastSubmissionLang = item.lastSubmission?.lang ?? "-";
  const submissionStatus = item.lastSubmission?.status ?? "-";
  const hintUsageCount =
    item.hintUsageCount ??
    item.lastSubmission?.hintUsageCount ??
    0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{item.problem.title}</CardTitle>
        <Button size="sm" onClick={handleReview} className="shrink-0">
          복습하기
        </Button>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-3">
          <span>티어: {item.problem.tier}</span>
          <span>레벨: {item.problem.level}</span>
          <span>카테고리: {item.problem.categories?.join(", ")}</span>
          <span>최근 제출: {lastSubmissionTime}</span>
          <span>제출 상태: {submissionStatus}</span>
          <span>사용언어: {lastSubmissionLang}</span>
          <span>힌트 사용량: {hintUsageCount}개</span>
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

