"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Target } from "lucide-react";

// 모의고사 세트 정의
const mockExamSets = [
  {
    id: "basic-30",
    title: "기초 다지기 30분",
    description: "브론즈~실버 난이도의 기본 문제로 구성된 입문자용 모의고사",
    duration: 30,
    problemCount: 3,
    difficulty: "BRONZE",
    problems: [
      { slug: "problem-2750", title: "수 정렬하기", tier: "BRONZE" },
      { slug: "problem-10773", title: "제로", tier: "SILVER" },
      { slug: "problem-9012", title: "괄호", tier: "SILVER" },
    ],
  },
  {
    id: "intermediate-60",
    title: "실력 점검 60분",
    description: "실버~골드 난이도로 구성된 중급자용 실전 모의고사",
    duration: 60,
    problemCount: 4,
    difficulty: "SILVER",
    problems: [
      { slug: "problem-11399", title: "ATM", tier: "SILVER" },
      { slug: "problem-1920", title: "수 찾기", tier: "SILVER" },
      { slug: "problem-1697", title: "숨바꼭질", tier: "SILVER" },
      { slug: "problem-11047", title: "동전 0", tier: "GOLD" },
    ],
  },
  {
    id: "advanced-90",
    title: "심화 도전 90분",
    description: "골드~플래티넘 난이도의 고난이도 심화 모의고사",
    duration: 90,
    problemCount: 5,
    difficulty: "GOLD",
    problems: [
      { slug: "problem-1149", title: "RGB거리", tier: "SILVER" },
      { slug: "problem-1010", title: "다리 놓기", tier: "SILVER" },
      { slug: "problem-11403", title: "경로 찾기", tier: "SILVER" },
      { slug: "problem-1202", title: "보석 도둑", tier: "GOLD" },
      { slug: "problem-12738", title: "가장 긴 증가하는 부분 수열 3", tier: "GOLD" },
    ],
  },
];

function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    BRONZE: "bg-amber-100 text-amber-800 border-amber-300",
    SILVER: "bg-slate-200 text-slate-700 border-slate-300",
    GOLD: "bg-yellow-100 text-yellow-700 border-yellow-300",
    PLATINUM: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };
  return colors[difficulty] || "bg-slate-200 text-slate-700 border-slate-300";
}

export default function MockExamPage() {
  const handleStartExam = (examId: string) => {
    // 심화 도전은 수정 중
    if (examId === "advanced-90") {
      alert("⚠️ 수정 중입니다\n\n심화 도전 90분 모의고사는 현재 오류 수정 중입니다.\n조금만 기다려주세요!");
      return;
    }

    // 모의고사 시작 - 문제 세트와 시작 시간을 localStorage에 저장
    const exam = mockExamSets.find((e) => e.id === examId);
    if (!exam) return;

    const examData = {
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      problems: exam.problems,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + exam.duration * 60 * 1000).toISOString(),
      currentProblemIndex: 0,
      completedProblems: [] as string[],
    };

    localStorage.setItem("currentMockExam", JSON.stringify(examData));

    // 첫 번째 문제로 이동
    window.location.href = `/problems/${exam.problems[0].slug}?exam=${examId}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/problems" className="text-sm text-primary hover:underline">
            ← 문제 목록으로 돌아가기
          </Link>
          <Link
            href="/problems/mock-exam/result"
            className="text-sm text-slate-600 hover:text-primary hover:underline"
          >
            이전 결과 보기 →
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">실전 모의고사</h1>
        <p className="text-slate-600">
          실제 코딩 테스트처럼 시간 제한이 있는 모의고사입니다.
          제한 시간 내에 최대한 많은 문제를 해결해보세요!
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {mockExamSets.map((exam) => (
          <Card
            key={exam.id}
            className="border-2 transition-all hover:border-primary/50 hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{exam.title}</CardTitle>
                    <Badge className={getDifficultyColor(exam.difficulty)}>
                      {exam.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {exam.description}
                  </CardDescription>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{exam.duration}분</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{exam.problemCount}문제</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>실전 모드</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-3 font-medium text-slate-700">출제 문제</h4>
                <div className="space-y-2">
                  {exam.problems.map((problem, index) => (
                    <div
                      key={problem.slug}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium">{problem.title}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(problem.tier)}
                      >
                        {problem.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={() => handleStartExam(exam.id)}
                  className="flex-1"
                  size="lg"
                >
                  모의고사 시작하기
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/problems/${exam.problems[0].slug}`}>
                    미리보기
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-slate-500">
                ⚠️ 모의고사를 시작하면 타이머가 시작됩니다. 중간에 나가도 시간은 계속 흐릅니다.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">모의고사 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>• 각 모의고사는 실제 코딩 테스트와 유사한 환경으로 구성되어 있습니다.</p>
          <p>• 제한 시간 내에 최대한 많은 문제를 해결하세요.</p>
          <p>• 모든 제출 기록이 저장되며, 시험 종료 후 결과를 확인할 수 있습니다.</p>
          <p>• 시간이 종료되어도 계속 문제를 풀 수 있지만, 기록에는 "시간 초과"로 표시됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
