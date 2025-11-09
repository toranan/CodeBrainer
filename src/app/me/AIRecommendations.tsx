"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReview } from "@/server/mypage-client";

export default function AIRecommendations({ userId }: { userId: number }) {
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

