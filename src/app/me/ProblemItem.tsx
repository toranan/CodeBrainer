"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getReview } from "@/server/mypage-client";

export default function ProblemItem({ item, userId }: { item: any; userId: number }) {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<any | null>(null);

  const load = async () => {
    const res = await getReview({ userId, baseProblemId: item.problem.id, limit: 3 });
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

