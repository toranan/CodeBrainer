"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ReviewTab() {
  // 임시 데이터 (나중에 API로 가져올 데이터)
  const weakCategories = [
    { name: "DP (동적 계획법)", accuracy: 40, problems: 15, correct: 6 },
    { name: "그리디 알고리즘", accuracy: 65, problems: 10, correct: 6 },
    { name: "그래프", accuracy: 55, problems: 12, correct: 7 },
  ];

  const wrongProblems = [
    { id: 1, title: "피보나치 수열", attempts: 3, lastAttempt: "2일 전", category: "DP" },
    { id: 2, title: "배낭 문제", attempts: 2, lastAttempt: "4일 전", category: "DP" },
    { id: 3, title: "다익스트라", attempts: 1, lastAttempt: "1주일 전", category: "그래프" },
  ];

  const recommendedProblems = [
    { id: 101, title: "DP 기초 문제 1", category: "DP", difficulty: "Bronze", reason: "DP 취약" },
    { id: 102, title: "DP 기초 문제 2", category: "DP", difficulty: "Bronze", reason: "DP 취약" },
    { id: 103, title: "그리디 연습", category: "그리디", difficulty: "Silver", reason: "그리디 취약" },
  ];

  return (
    <div className="space-y-6">
      {/* 취약 알고리즘 분석 */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 취약 알고리즘 분석</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* 틀린 문제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>❌ 틀린 문제 복습하기</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Link href={`/problems/${problem.id}`}>
                  <Button size="sm" variant="outline">
                    다시 풀기
                  </Button>
                </Link>
              </div>
            ))}
            {wrongProblems.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                틀린 문제가 없어요! 완벽해요! 🎉
              </p>
            )}
          </div>
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
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">DP 복습 진행도</span>
                <span className="text-sm text-slate-600">2 / 5 완료</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-orange-500 transition-all" style={{ width: "40%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">그리디 복습 진행도</span>
                <span className="text-sm text-slate-600">1 / 3 완료</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-blue-500 transition-all" style={{ width: "33%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">이번 주 복습 목표</span>
                <span className="text-sm text-slate-600">3 / 5 완료</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-green-500 transition-all" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

