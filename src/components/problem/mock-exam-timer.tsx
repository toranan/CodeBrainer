"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MockExamData {
  id: string;
  title: string;
  duration: number; // minutes
  problems: Array<{
    slug: string;
    title: string;
    tier: string;
  }>;
  startTime: string;
  endTime: string;
  currentProblemIndex: number;
  completedProblems: string[];
}

export function MockExamTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam");

  const [examData, setExamData] = useState<MockExamData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasShownTimeUpAlert, setHasShownTimeUpAlert] = useState(false);

  useEffect(() => {
    if (!examId) return;

    const stored = localStorage.getItem("currentMockExam");
    if (!stored) {
      router.push("/problems/mock-exam");
      return;
    }

    const data: MockExamData = JSON.parse(stored);
    setExamData(data);

    // 초기 남은 시간 계산
    const updateRemainingTime = () => {
      const now = Date.now();
      const end = new Date(data.endTime).getTime();
      const remaining = Math.max(0, end - now);
      setTimeRemaining(remaining);
      return remaining;
    };

    // 즉시 한 번 실행
    updateRemainingTime();

    // 타이머 업데이트 (1초마다)
    const interval = setInterval(() => {
      const remaining = updateRemainingTime();
      
      // localStorage의 완료 상태를 실시간으로 동기화
      const currentStored = localStorage.getItem("currentMockExam");
      if (currentStored) {
        const currentData: MockExamData = JSON.parse(currentStored);
        setExamData(currentData);
      }
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [examId, router]);

  // 시간 종료 시 자동으로 결과 페이지로 이동
  useEffect(() => {
    if (timeRemaining === 0 && examData && !hasShownTimeUpAlert) {
      setHasShownTimeUpAlert(true);
      
      setTimeout(() => {
        if (confirm("시간이 종료되었습니다. 결과를 확인하시겠습니까?")) {
          // 결과 데이터 생성
          const now = Date.now();
          const startTime = new Date(examData.startTime).getTime();
          const timeSpent = now - startTime;

          const result = {
            id: examData.id,
            title: examData.title,
            duration: examData.duration,
            problems: examData.problems,
            startTime: examData.startTime,
            endTime: new Date().toISOString(),
            completedProblems: examData.completedProblems,
            timeSpent: timeSpent,
          };

          // 결과 저장
          localStorage.setItem("lastMockExamResult", JSON.stringify(result));
          localStorage.removeItem("currentMockExam");
          
          // 결과 페이지로 이동
          router.push("/problems/mock-exam/result");
        }
      }, 500);
    }
  }, [timeRemaining, examData, hasShownTimeUpAlert, router]);

  if (!examId || !examData) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isTimeUp = timeRemaining === 0;
  const currentProblemSlug = pathname.split("/").pop() || "";
  const currentProblemIndex = examData.problems.findIndex(
    (p) => p.slug === currentProblemSlug
  );

  const handlePrevProblem = () => {
    const prevIndex = currentProblemIndex - 1;
    if (prevIndex >= 0) {
      // localStorage의 currentProblemIndex 업데이트
      const updatedExamData = {
        ...examData,
        currentProblemIndex: prevIndex,
      };
      localStorage.setItem("currentMockExam", JSON.stringify(updatedExamData));
      
      router.push(`/problems/${examData.problems[prevIndex].slug}?exam=${examId}`);
    }
  };

  const handleNextProblem = () => {
    const nextIndex = currentProblemIndex + 1;
    if (nextIndex < examData.problems.length) {
      // localStorage의 currentProblemIndex 업데이트
      const updatedExamData = {
        ...examData,
        currentProblemIndex: nextIndex,
      };
      localStorage.setItem("currentMockExam", JSON.stringify(updatedExamData));
      
      router.push(`/problems/${examData.problems[nextIndex].slug}?exam=${examId}`);
    }
  };

  const handleEndExam = () => {
    if (confirm("모의고사를 종료하시겠습니까?")) {
      // 결과 데이터 생성
      const now = Date.now();
      const startTime = new Date(examData.startTime).getTime();
      const timeSpent = now - startTime;

      const result = {
        id: examData.id,
        title: examData.title,
        duration: examData.duration,
        problems: examData.problems,
        startTime: examData.startTime,
        endTime: new Date().toISOString(),
        completedProblems: examData.completedProblems,
        timeSpent: timeSpent,
      };

      // 결과 저장
      localStorage.setItem("lastMockExamResult", JSON.stringify(result));
      localStorage.removeItem("currentMockExam");
      
      // 결과 페이지로 이동
      router.push("/problems/mock-exam/result");
    }
  };

  const handleGoToProblem = (problemSlug: string, index: number) => {
    // localStorage의 currentProblemIndex 업데이트
    const updatedExamData = {
      ...examData,
      currentProblemIndex: index,
    };
    localStorage.setItem("currentMockExam", JSON.stringify(updatedExamData));
    
    router.push(`/problems/${problemSlug}?exam=${examId}`);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={`fixed right-4 top-20 z-50 border-2 ${isTimeUp ? "border-red-500 bg-red-50" : "border-primary bg-primary/5"} shadow-lg transition-all ${isExpanded ? "w-80" : "w-16"}`}>
      <div className="p-4">
        {isExpanded ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${isTimeUp ? "text-red-600" : "text-primary"}`} />
                <span className="font-semibold">{examData.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="h-6 w-6 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold ${isTimeUp ? "text-red-600" : "text-primary"}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground">
                {isTimeUp ? "시간 종료" : "남은 시간"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">문제 진행 상황</div>
              <div className="space-y-1">
                {examData.problems.map((problem, index) => {
                  const isCurrent = problem.slug === currentProblemSlug;
                  const isCompleted = examData.completedProblems.includes(problem.slug);

                  return (
                    <button
                      key={problem.slug}
                      onClick={() => handleGoToProblem(problem.slug, index)}
                      className={`flex w-full items-center gap-2 rounded p-2 text-sm transition-colors hover:opacity-80 ${
                        isCurrent
                          ? "bg-primary/20 font-semibold"
                          : isCompleted
                            ? "bg-green-100"
                            : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs">
                        {index + 1}
                      </span>
                      <span className="flex-1 truncate text-left">{problem.title}</span>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                {currentProblemIndex > 0 && (
                  <Button
                    onClick={handlePrevProblem}
                    size="sm"
                    className="flex-1"
                    variant="outline"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" /> 이전 문제
                  </Button>
                )}
                {currentProblemIndex < examData.problems.length - 1 && (
                  <Button
                    onClick={handleNextProblem}
                    size="sm"
                    className="flex-1"
                    variant="outline"
                  >
                    다음 문제 <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleEndExam}
                size="sm"
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                모의고사 종료
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            <Clock className={`h-5 w-5 ${isTimeUp ? "text-red-600" : "text-primary"}`} />
          </Button>
        )}
      </div>
    </Card>
  );
}

