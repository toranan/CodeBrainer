"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAIRecommendations } from "@/server/mypage-client";

export default function AIRecommendations({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["me/ai-recommendations", userId],
    queryFn: () => getAIRecommendations({ userId, limit: 5 }),
    enabled: userId !== null,
  });

  const recommendations = data?.recommendations ?? [];
  const reason = data?.reason ?? "";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">🤖 AI 추천 복습 문제</CardTitle>
        <Button size="sm" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "로딩 중..." : "새로고침"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            AI 추천 문제를 분석 중입니다...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-600">
            추천 문제를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {reason && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                💡 {reason}
              </div>
            )}
            <div className="space-y-3">
              {recommendations.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">{problem.title}</div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="rounded bg-slate-100 px-2 py-0.5">{problem.tier}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5">Level {problem.level}</span>
                      {problem.categories?.map((cat, idx) => (
                        <span key={idx} className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/problems/${problem.slug || problem.id}`}>
                    <Button size="sm" variant="outline" className="ml-4">
                      풀어보기
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            추천할 문제가 없습니다. 더 많은 문제를 풀어보세요!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

