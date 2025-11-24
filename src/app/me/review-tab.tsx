"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getWeakCategories, getWrongProblems } from "@/server/mypage-client";

export function ReviewTab({ userId }: { userId: string | null }) {
  const { data: weakCategoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["me/review/weak-categories", userId],
    queryFn: () => getWeakCategories({ userId: userId! }),
    enabled: userId !== null,
  });

  const { data: wrongProblemsData, isLoading: isLoadingWrongProblems } = useQuery({
    queryKey: ["me/review/wrong-problems", userId],
    queryFn: () => getWrongProblems({ userId: userId! }),
    enabled: userId !== null,
  });

  const weakCategories =
    weakCategoriesData?.map((cat) => ({
      name: cat.category,
      accuracy: Math.round(cat.accuracy * 100),
      problems: cat.totalProblems,
      correct: cat.correctProblems,
    })) ?? [];

  const wrongProblems =
    wrongProblemsData?.map((problem) => {
      const lastAttemptDate = new Date(problem.lastAttemptAt);
      const now = new Date();
      const diffMs = now.getTime() - lastAttemptDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let lastAttempt: string;
      if (diffDays === 0) {
        lastAttempt = "오늘";
      } else if (diffDays === 1) {
        lastAttempt = "1일 전";
      } else if (diffDays < 7) {
        lastAttempt = `${diffDays}일 전`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        lastAttempt = `${weeks}주일 전`;
      } else {
        const months = Math.floor(diffDays / 30);
        lastAttempt = `${months}개월 전`;
      }

      return {
        id: problem.problemId,
        title: problem.title,
        attempts: problem.attemptCount,
        lastAttempt,
        category: problem.categories?.[0] ?? "기타",
        slug: problem.slug,
      };
    }) ?? [];

  // 추천 문제 (현재는 빈 배열, 필요시 별도 API 추가)
  const recommendedProblems: any[] = [];

  return (
    <div className="space-y-6">
      {/* 취약 알고리즘 분석 */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 취약 알고리즘 분석</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCategories ? (
            <p className="py-8 text-center text-sm text-slate-500">로딩 중...</p>
          ) : (
            <div className="space-y-4">
              {weakCategories.map((category, idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-slate-600">
                        {category.correct} / {category.problems} 문제 정답
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        category.accuracy < 50
                          ? "bg-red-100 text-red-800"
                          : category.accuracy < 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {category.accuracy}%
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all ${
                        category.accuracy < 50
                          ? "bg-red-500"
                          : category.accuracy < 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${category.accuracy}%` }}
                    />
                  </div>
                  {category.accuracy < 70 && (
                    <p className="mt-2 text-xs text-slate-500">
                      ⚠️ 이 분야 복습이 필요해요!
                    </p>
                  )}
                </div>
              ))}
              {weakCategories.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  아직 데이터가 충분하지 않아요. 문제를 더 풀어보세요!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 틀린 문제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>❌ 틀린 문제 복습하기</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWrongProblems ? (
            <p className="py-8 text-center text-sm text-slate-500">로딩 중...</p>
          ) : (
            <div className="space-y-3">
              {wrongProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{problem.title}</h3>
                    <div className="mt-1 flex gap-3 text-xs text-slate-500">
                      <span>🔁 {problem.attempts}회 시도</span>
                      <span>🕒 {problem.lastAttempt}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5">{problem.category}</span>
                    </div>
                  </div>
              ))}
              {wrongProblems.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  틀린 문제가 없어요! 완벽해요! 🎉
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 맞춤 복습 문제 추천 */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 AI 맞춤 복습 문제 추천</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            취약한 알고리즘을 기반으로 추천된 문제입니다
          </p>
          <div className="space-y-3">
            {recommendedProblems.map((problem) => (
              <div key={problem.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{problem.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        problem.difficulty === "Bronze"
                          ? "bg-amber-100 text-amber-800"
                          : problem.difficulty === "Silver"
                          ? "bg-slate-300 text-slate-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5">{problem.category}</span>
                    <span>💡 {problem.reason}</span>
                  </div>
                </div>
                <Link href={`/problems/${problem.id}`}>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    풀어보기
                  </Button>
                </Link>
              </div>
            ))}
            {recommendedProblems.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                추천 문제가 없어요. 더 많은 문제를 풀어보세요!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 복습 진행 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 복습 진행 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weakCategories.slice(0, 3).map((category, idx) => {
              const colors = ["orange", "blue", "green"];
              const color = colors[idx % colors.length];
              return (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{category.name} 복습 진행도</span>
                    <span className="text-sm text-slate-600">
                      {category.correct} / {category.problems} 완료
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full bg-${color}-500 transition-all`}
                      style={{ width: `${category.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {weakCategories.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                취약한 알고리즘이 없어요! 잘하고 계세요! 
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

