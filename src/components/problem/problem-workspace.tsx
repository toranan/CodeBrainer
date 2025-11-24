"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LANGUAGE_LABEL, MONACO_LANGUAGE_MAP } from "@/constants/languages";
import type {
  AiReviewResponse,
  HintOpenResponse,
  JudgeRunResponse,
  ProblemDetail,
  ProblemHint,
  SupportedLanguage,
} from "@/types/problem";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full" />,
});

interface HintState {
  status: "locked" | "loading" | "cooldown" | "unlocked";
  hint?: ProblemHint;
  nextAvailable?: number; // epoch ms
}

interface JudgeState {
  status: "idle" | "running" | "submitting";
  result?: JudgeRunResponse;
}

interface ReviewState {
  status: "idle" | "loading" | "ready";
  data?: AiReviewResponse;
}

interface ProblemWorkspaceProps {
  problem: ProblemDetail;
  initialCodeMap?: Partial<Record<SupportedLanguage, string>>;
}

const defaultSnippet = `// TODO: 여기에 코드를 작성하세요.`;

type SectionKey = "statement" | "hints";

export function ProblemWorkspace({ problem, initialCodeMap }: ProblemWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"statement" | "hints">("statement");
  const [language, setLanguage] = useState<SupportedLanguage>(
    problem.languages[0] ?? "PYTHON",
  );
  const [codeMap, setCodeMap] = useState<Record<SupportedLanguage, string>>(() => {
    const map = {} as Record<SupportedLanguage, string>;
    problem.languages.forEach((lang) => {
      map[lang] = initialCodeMap?.[lang] ?? defaultSnippet;
    });
    return map;
  });

  const [judgeState, setJudgeState] = useState<JudgeState>({ status: "idle" });
  const [reviewState, setReviewState] = useState<ReviewState>({ status: "idle" });
  const [authUser, setAuthUser] = useState<{ userId: string; token: string | null } | null>(null);

  const [hintStates, setHintStates] = useState<Record<number, HintState>>(() => {
    const initial: Record<number, HintState> = {};
    problem.hints.forEach((hint) => {
      initial[hint.stage] = { status: "locked" };
    });
    return initial;
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadAuthUser = () => {
      if (typeof window === "undefined") return;
      const token = window.localStorage.getItem("token");
      const userJson = window.localStorage.getItem("user");
      if (userJson) {
        try {
          const parsed = JSON.parse(userJson);
          const userId = parsed?.userId != null ? String(parsed.userId) : "";
          if (userId) {
            setAuthUser({ userId, token });
            return;
          }
        } catch (err) {
          console.error("사용자 정보 파싱 실패:", err);
        }
      }
      setAuthUser(null);
    };

    loadAuthUser();
    window.addEventListener("storage", loadAuthUser);
    window.addEventListener("authChange", loadAuthUser);

    return () => {
      window.removeEventListener("storage", loadAuthUser);
      window.removeEventListener("authChange", loadAuthUser);
    };
  }, []);

  useEffect(() => {
    const hasCooldown = Object.values(hintStates).some(
      (state) => state.status === "cooldown" && state.nextAvailable,
    );

    if (!hasCooldown) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hintStates]);

  const currentCode = codeMap[language] ?? defaultSnippet;

  const difficultyLabel = useMemo(() => {
    switch (problem.difficulty) {
      case "BRONZE":
        return "Bronze";
      case "SILVER":
        return "Silver";
      case "GOLD":
        return "Gold";
      case "PLATINUM":
        return "Platinum";
      case "DIAMOND":
        return "Diamond";
      default:
        return problem.difficulty;
    }
  }, [problem.difficulty]);

  const difficultyColor = useMemo(() => {
    switch (problem.difficulty) {
      case "BRONZE":
        return "bg-amber-100 text-amber-800";
      case "SILVER":
        return "bg-slate-200 text-slate-700";
      case "GOLD":
        return "bg-yellow-100 text-yellow-700";
      case "PLATINUM":
        return "bg-emerald-100 text-emerald-700";
      case "DIAMOND":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  }, [problem.difficulty]);

  const handleCodeChange = (value?: string) => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: value ?? "",
    }));
  };

  const handleResetCode = () => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: defaultSnippet,
    }));
    toast("코드를 초기화했어요.");
  };

  const handleRun = async () => {
    setJudgeState({ status: "running" });
    try {
      const res = await fetch("/api/judge/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code: currentCode,
          mode: "run",
          userId: authUser?.userId,
        }),
      });

      if (!res.ok) {
        throw new Error("채점 서버 호출에 실패했습니다.");
      }

      const data: JudgeRunResponse = await res.json();
      setJudgeState({ status: "idle", result: data });

      if (data.status === "AC") {
        toast.success("테스트 케이스를 통과했어요!");
      } else {
        toast(<div>일부 테스트가 통과하지 않았어요.</div>);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "채점에 실패했어요.");
      setJudgeState({ status: "idle" });
    }
  };

  const handleSubmit = async () => {
    if (!authUser?.userId) {
      toast.error("로그인이 필요합니다. 먼저 로그인해주세요.");
      setJudgeState({ status: "idle" });
      return;
    }

    // 힌트 사용량 계산 (unlocked 상태인 힌트 개수)
    const hintUsageCount = Object.values(hintStates).filter(
      (state) => state.status === "unlocked"
    ).length;

    // 디버깅: 힌트 상태 확인
    console.log("힌트 상태:", hintStates);
    console.log("계산된 힌트 사용량:", hintUsageCount);

    setJudgeState({ status: "submitting" });
    try {
      const requestBody = {
        problemId: problem.slug,
        language,
        code: currentCode,
        mode: "submit",
        userId: authUser.userId,
        token: authUser.token,
        hintUsageCount, // 힌트 사용량 전송
      };
      console.log("제출 요청 본문:", { ...requestBody, code: "[코드 생략]" });
      
      const res = await fetch("/api/judge/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error("제출에 실패했습니다.");
      }

      const data: JudgeRunResponse = await res.json();
      setJudgeState({ status: "idle", result: data });

      if (data.status === "AC") {
        toast.success("정답입니다! AI 리뷰를 준비중이에요.");
        await fetchAiReview(data.submissionId);
      } else {
        toast("정답이 아닙니다. 결과 패널을 확인하세요.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "제출 중 문제가 발생했어요.");
      setJudgeState({ status: "idle" });
    }
  };

  const fetchAiReview = async (submissionId?: number) => {
    setReviewState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          userCode: currentCode,
          submissionId,
        }),
      });

      if (!res.ok) {
        throw new Error("AI 리뷰 요청에 실패했습니다.");
      }

      const data: AiReviewResponse = await res.json();
      setReviewState({ status: "ready", data });
    } catch (error) {
      console.error(error);
      toast.error("AI 리뷰를 받아오는 중 오류가 발생했습니다.");
      setReviewState({ status: "idle" });
    }
  };

  const handleOpenHint = async (hint: ProblemHint) => {
    setActiveTab("hints");
    setHintStates((prev) => ({
      ...prev,
      [hint.stage]: {
        ...prev[hint.stage],
        status: "loading",
      },
    }));

    try {
      const res = await fetch("/api/hints/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: problem.id,
          stage: hint.stage,
        }),
      });

      if (!res.ok) {
        throw new Error("힌트를 열 수 없습니다.");
      }

      const data: HintOpenResponse = await res.json();

      if (data.allowed && data.hint) {
        toast.success(`${hint.stage}단계 힌트를 열었습니다.`);
        setHintStates((prev) => ({
          ...prev,
          [hint.stage]: {
            status: "unlocked",
            hint: data.hint,
          },
        }));
      } else if (typeof data.remainingSeconds === "number") {
        toast("아직 대기시간이 남아 있어요.");
        setHintStates((prev) => ({
          ...prev,
          [hint.stage]: {
            status: "cooldown",
            nextAvailable: Date.now() + (data.remainingSeconds ?? 0) * 1000,
          },
        }));
      } else {
        toast("이 힌트는 아직 열 수 없습니다.");
        setHintStates((prev) => ({
          ...prev,
          [hint.stage]: { status: "locked" },
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("힌트를 불러오지 못했어요.");
      setHintStates((prev) => ({
        ...prev,
        [hint.stage]: { status: "locked" },
      }));
    }
  };

  const renderHintContent = (hint: ProblemHint) => {
    const state = hintStates[hint.stage];
    if (!state) return null;

    if (state.status === "unlocked" && state.hint) {
      return (
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.hint.content}</ReactMarkdown>
        </div>
      );
    }

    if (state.status === "cooldown" && state.nextAvailable) {
      const remaining = Math.max(0, state.nextAvailable - now);
      const seconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;
      return (
        <p className="text-sm text-slate-500">
          아직 {minutes}분 {rest}초 후에 확인할 수 있어요.
        </p>
      );
    }

    return (
      <p className="text-sm text-slate-500">
        버튼을 눌러 힌트를 열어보세요. 대기시간이 있을 수 있습니다.
      </p>
    );
  };

  const verdictColor = (verdict: string) => {
    switch (verdict) {
      case "AC":
        return "text-emerald-600";
      case "WA":
        return "text-red-500";
      case "TLE":
        return "text-orange-500";
      case "RE":
      case "CE":
        return "text-amber-500";
      default:
        return "text-slate-600";
    }
  };

  const isBusy = judgeState.status === "running" || judgeState.status === "submitting";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge className={difficultyColor}>{difficultyLabel}</Badge>
            <div className="flex gap-2 text-xs text-muted-foreground">
              {problem.categories.map((category) => (
                <span key={category} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  #{category}
                </span>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {problem.title}
          </h1>
          <p className="text-sm text-slate-500">문제 ID: {problem.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-500">
          <span>지원 언어 {problem.languages.length}종</span>
          <span>최종 수정 {new Date(problem.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="min-h-[560px]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === "statement" ? "문제 정보" : "힌트"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "statement"
                    ? "문제 설명, 입출력 예시, 제약 조건을 확인하세요."
                    : "힌트를 차례대로 열어 풀이 방향을 확인하세요."}
                </CardDescription>
              </div>
            </div>
            <SectionTabs activeTab={activeTab} onChange={setActiveTab} />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[720px]">
              <div className="space-y-8 px-6 py-4">
                {activeTab === "statement" ? (
                  <SectionContentStatement problem={problem} />
                ) : (
                  <SectionContentHints
                    problem={problem}
                    hintStates={hintStates}
                    renderHintContent={renderHintContent}
                    onOpenHint={handleOpenHint}
                  />
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">코드 에디터</CardTitle>
                  <CardDescription>
                    지원 언어를 선택하고 코드를 작성한 뒤 실행 또는 제출하세요.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-500">언어</Label>
                    <Select value={language} onValueChange={(value: SupportedLanguage) => setLanguage(value)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {problem.languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {LANGUAGE_LABEL[lang] ?? lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleResetCode}>
                      초기화
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRun}
                      disabled={isBusy}
                    >
                      {judgeState.status === "running" ? "실행 중..." : "실행"}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isBusy} size="sm">
                      {judgeState.status === "submitting" ? "제출 중..." : "제출"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <MonacoEditor
                  value={currentCode}
                  onChange={handleCodeChange}
                  language={MONACO_LANGUAGE_MAP[language] ?? "plaintext"}
                  theme="vs"
                  height="420px"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">결과 패널</CardTitle>
              <CardDescription>
                테스트 케이스별 결과와 컴파일 로그를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {judgeState.result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">최종 상태</p>
                      <p className={`text-lg font-semibold ${verdictColor(judgeState.result.status)}`}>
                        {judgeState.result.status}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date().toLocaleTimeString()} 기준
                    </div>
                  </div>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">테스트케이스</TableHead>
                          <TableHead>결과</TableHead>
                          <TableHead className="text-right">시간(ms)</TableHead>
                          <TableHead className="text-right">메모리(KB)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {judgeState.result.results.map((item) => (
                          <TableRow key={item.testcaseId}>
                            <TableCell className="font-medium">{item.testcaseId}</TableCell>
                            <TableCell className={`font-semibold ${verdictColor(item.verdict)}`}>
                              {item.verdict}
                            </TableCell>
                            <TableCell className="text-right">{item.timeMs}</TableCell>
                            <TableCell className="text-right">{item.memoryKb}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {judgeState.result.compileLog ? (
                    <div>
                      <Label className="text-xs uppercase text-slate-500">컴파일 로그</Label>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100">
                        {judgeState.result.compileLog}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  아직 실행한 기록이 없습니다. 코드를 실행하거나 제출하면 결과가 표시됩니다.
                </p>
              )}
            </CardContent>
          </Card>

          {reviewState.status === "ready" && reviewState.data ? (
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg">AI 코드 리뷰</CardTitle>
                <CardDescription>
                  정답 코드와 모범답안을 비교한 개선 포인트입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800">개선 포인트</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {reviewState.data.improvements.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800">다른 접근법</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {reviewState.data.altApproaches.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800">예시 코드</h3>
                  <p className="text-xs text-slate-500">언어: {LANGUAGE_LABEL[reviewState.data.finalSolution.language]}</p>
                  <pre className="max-h-[360px] overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100">
                    {reviewState.data.finalSolution.code}
                  </pre>
                </section>
              </CardContent>
            </Card>
          ) : reviewState.status === "loading" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI 리뷰 생성 중...</CardTitle>
                <CardDescription>정답을 바탕으로 맞춤형 리뷰를 준비하고 있어요.</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-36 w-full" />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const SectionBlock = ({
  sectionKey,
  icon,
  label,
  children,
  showHeading = true,
}: {
  sectionKey: SectionKey;
  icon: string;
  label: string;
  children: React.ReactNode;
  showHeading?: boolean;
}) => (
  <section className="space-y-4" data-section={sectionKey}>
    {showHeading ? (
      <h2 className="border-b pb-2 text-lg font-semibold text-slate-900">
        {icon} {label}
      </h2>
    ) : null}
    {children}
  </section>
);

const SectionTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: "statement" | "hints";
  onChange: (key: "statement" | "hints") => void;
}) => (
  <Tabs value={activeTab} onValueChange={(value) => onChange(value as "statement" | "hints")}
    className="w-full">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="statement">문제 설명</TabsTrigger>
      <TabsTrigger value="hints">힌트</TabsTrigger>
    </TabsList>
  </Tabs>
);

const SectionContentStatement = ({ problem }: { problem: ProblemDetail }) => (
  <SectionBlock sectionKey="statement" icon="📝" label="문제 설명">
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.statement}</ReactMarkdown>
    </div>
    <Separator />
    <div className="space-y-6">
      {problem.ioSample.inputFormat ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">입력 형식</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{problem.ioSample.inputFormat}</p>
        </div>
      ) : null}
      {problem.ioSample.outputFormat ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">출력 형식</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{problem.ioSample.outputFormat}</p>
        </div>
      ) : null}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">예시</h3>
        <div className="space-y-4">
          {problem.ioSample.samples.map((sample, index) => (
            <div key={index} className="rounded-lg border bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-700">예시 {index + 1}</h4>
              <Separator className="my-3" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">입력</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-700 shadow-inner">
                    {sample.input}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">출력</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-700 shadow-inner">
                    {sample.output}
                  </pre>
                </div>
              </div>
              {sample.explanation ? (
                <p className="mt-3 text-xs text-slate-600">{sample.explanation}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {problem.ioSample.notes ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">비고</h3>
          <p className="text-sm text-slate-600">{problem.ioSample.notes}</p>
        </div>
      ) : null}
    </div>
    <Separator />
    {problem.constraints ? (
      <div className="prose prose-slate max-w-none text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.constraints}</ReactMarkdown>
      </div>
    ) : (
      <p className="text-sm text-slate-500">등록된 제약 조건이 없습니다.</p>
    )}
  </SectionBlock>
);

const SectionContentHints = ({
  problem,
  hintStates,
  renderHintContent,
  onOpenHint,
}: {
  problem: ProblemDetail;
  hintStates: Record<number, HintState>;
  renderHintContent: (hint: ProblemHint) => React.ReactNode;
  onOpenHint: (hint: ProblemHint) => void;
}) => (
  <SectionBlock sectionKey="hints" icon="💡" label="힌트">
    <div className="space-y-4">
      {problem.hints.map((hint) => {
        const state = hintStates[hint.stage] ?? { status: "locked" };
        const isUnlocked = state.status === "unlocked";
        return (
          <Card key={hint.stage} className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base text-slate-800">
                  {hint.stage}단계 힌트 {hint.title ? `· ${hint.title}` : ""}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  대기시간 {Math.round(hint.waitSeconds / 60)}분
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant={isUnlocked ? "subtle" : "default"}
                disabled={state.status === "loading" || isUnlocked}
                onClick={() => onOpenHint(hint)}
              >
                {state.status === "loading"
                  ? "열리는 중..."
                  : isUnlocked
                  ? "열람 완료"
                  : "힌트 열기"}
              </Button>
            </CardHeader>
            <CardContent>{renderHintContent(hint)}</CardContent>
          </Card>
        );
      })}
    </div>
  </SectionBlock>
);

