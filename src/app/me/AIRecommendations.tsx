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
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🧠</div>
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">간격 반복 학습 (Spaced Repetition)</div>
                    <div className="text-sm text-blue-800">{reason}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {recommendations.map((problem, idx) => (
                <div
                  key={problem.id}
                  className="group relative flex items-center justify-between rounded-lg border-2 border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  {/* 복습 우선순위 뱃지 */}
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white shadow-lg">
                    {idx + 1}
                  </div>

                  <div className="flex-1 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-slate-900">{problem.title}</div>
                      {idx === 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 animate-pulse">
                          🔥 최우선
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {problem.tier}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                        Level {problem.level}
                      </span>
                      {problem.categories?.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="rounded-md bg-blue-100 px-2 py-1 text-blue-800">
                          #{cat}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      💭 망각 곡선 상 최적의 복습 타이밍입니다
                    </div>
                  </div>

                  <Link href={`/problems/${problem.slug || problem.id}`}>
                    <Button
                      size="sm"
                      className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    >
                      복습하기 →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* 추가 안내 */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="text-sm text-slate-700">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <span>📚</span>
                  <span>간격 반복 학습이란?</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 ml-6 list-disc">
                  <li>뇌 과학 연구에 기반한 효율적인 학습 방법</li>
                  <li>망각 곡선을 고려해 최적의 타이밍에 복습</li>
                  <li>1일 → 3일 → 7일 → 14일 → 30일 간격으로 복습</li>
                  <li>장기 기억으로 전환되어 실력 향상 효과 극대화</li>
                </ul>
              </div>
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

