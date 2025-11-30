"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, CheckCircle, XCircle, Target, Calendar } from "lucide-react";

interface MockExamResult {
  id: string;
  title: string;
  duration: number;
  problems: Array<{
    slug: string;
    title: string;
    tier: string;
  }>;
  startTime: string;
  endTime: string;
  completedProblems: string[];
  timeSpent: number; // 실제 사용한 시간 (ms)
}

function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    BRONZE: "bg-amber-100 text-amber-800 border-amber-300",
    SILVER: "bg-slate-200 text-slate-700 border-slate-300",
    GOLD: "bg-yellow-100 text-yellow-700 border-yellow-300",
    PLATINUM: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };
  return colors[difficulty] || "bg-slate-200 text-slate-700 border-slate-300";
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds}초`;
}

export default function MockExamResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MockExamResult | null>(null);

  useEffect(() => {
    // localStorage에서 마지막 모의고사 결과 가져오기
    const stored = localStorage.getItem("lastMockExamResult");
    if (!stored) {
      router.push("/problems/mock-exam");
      return;
    }

    const data: MockExamResult = JSON.parse(stored);
    setResult(data);
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">결과를 불러오는 중...</p>
      </div>
    );
  }

  const completedCount = result.completedProblems.length;
  const totalCount = result.problems.length;
  const score = Math.round((completedCount / totalCount) * 100);
  const usedAllTime = result.timeSpent >= result.duration * 60 * 1000;

  const getScoreMessage = () => {
    if (score === 100) return "완벽합니다! 🎉";
    if (score >= 80) return "훌륭합니다! 👏";
    if (score >= 60) return "잘했어요! 💪";
    if (score >= 40) return "괜찮아요! 📈";
    return "다음엔 더 잘할 수 있어요! 💡";
  };

  const getGrade = () => {
    if (score === 100) return { grade: "S", color: "text-yellow-500" };
    if (score >= 80) return { grade: "A", color: "text-green-500" };
    if (score >= 60) return { grade: "B", color: "text-blue-500" };
    if (score >= 40) return { grade: "C", color: "text-orange-500" };
    return { grade: "D", color: "text-red-500" };
  };

  const grade = getGrade();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="space-y-4 text-center">
        <div className={`text-8xl font-bold ${grade.color}`}>{grade.grade}</div>
        <h1 className="text-3xl font-semibold text-slate-900">모의고사 결과</h1>
        <p className="text-lg text-slate-600">{getScoreMessage()}</p>
      </header>

      {/* 점수 카드 */}
      <Card className="border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{result.title}</CardTitle>
          <CardDescription>
            {new Date(result.startTime).toLocaleString("ko-KR")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <div className="text-3xl font-bold text-primary">{score}점</div>
              <div className="text-sm text-slate-600">총점</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <Target className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <div className="text-3xl font-bold text-slate-900">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-slate-600">정답 문제</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <div className="text-3xl font-bold text-slate-900">
                {formatTime(result.timeSpent)}
              </div>
              <div className="text-sm text-slate-600">소요 시간</div>
            </div>
          </div>

          {!usedAllTime && (
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-700">
                ⏱️ 제한 시간보다 {formatTime((result.duration * 60 * 1000) - result.timeSpent)} 빠르게 완료했습니다!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문제별 결과 */}
      <Card>
        <CardHeader>
          <CardTitle>문제별 결과</CardTitle>
          <CardDescription>각 문제의 풀이 결과를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.problems.map((problem, index) => {
            const isCompleted = result.completedProblems.includes(problem.slug);

            return (
              <div
                key={problem.slug}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{problem.title}</div>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(problem.tier)}
                    >
                      {problem.tier}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-600">정답</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-600">미완료</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 통계</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                시작 시간
              </div>
              <div className="font-medium">
                {new Date(result.startTime).toLocaleTimeString("ko-KR")}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                종료 시간
              </div>
              <div className="font-medium">
                {new Date(result.endTime).toLocaleTimeString("ko-KR")}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                제한 시간
              </div>
              <div className="font-medium">{result.duration}분</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <Trophy className="h-4 w-4" />
                정답률
              </div>
              <div className="font-medium">{score}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button asChild className="flex-1" size="lg">
          <Link href="/problems/mock-exam">다른 모의고사 풀기</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1" size="lg">
          <Link href="/problems">문제 목록으로</Link>
        </Button>
      </div>

      {completedCount < totalCount && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-orange-700">
              💡 틀린 문제를 다시 풀어보면서 실력을 향상시켜보세요!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

