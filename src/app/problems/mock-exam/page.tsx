import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchProblemSummaries } from "@/server/problem-service"

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}…`
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    BRONZE: "bg-amber-100 text-amber-800",
    SILVER: "bg-slate-200 text-slate-700",
    GOLD: "bg-yellow-100 text-yellow-700",
    PLATINUM: "bg-emerald-100 text-emerald-700",
    DIAMOND: "bg-indigo-100 text-indigo-700",
  }

  const className = map[difficulty] ?? "bg-slate-200 text-slate-700"

  return <Badge className={className}>{difficulty}</Badge>
}

export default async function MockExamPage() {
  const problems = await fetchProblemSummaries()

  // "모의고사" 카테고리가 있는 문제만 필터링
  const mockExamProblems = problems.filter((p) => p.categories.includes("모의고사"))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <Link href="/problems" className="text-sm text-primary hover:underline">
          ← 문제 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-semibold text-slate-900">실전 모의고사</h1>
        <p className="text-sm text-slate-600">
          실전처럼 시간 제한이 있는 모의고사 문제입니다. 실력을 테스트하고 싶다면 도전해보세요!
        </p>
      </header>

      <div className="space-y-4">
        {mockExamProblems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              아직 등록된 모의고사 문제가 없습니다.
            </CardContent>
          </Card>
        ) : (
          mockExamProblems.map((problem) => (
            <Card key={problem.slug} className="border border-slate-200 transition hover:border-primary/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span className="text-slate-400">·</span>
                    <span>문제 ID: {problem.slug}</span>
                    <span className="text-slate-400">·</span>
                    <Badge variant="destructive" className="text-xs">모의고사</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    <Link href={`/problems/${problem.slug}`} className="transition hover:text-primary">
                      {problem.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {truncate(problem.statement.replace(/\n+/g, " "), 120)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-500">
                  <span>언어 {problem.languages.length}종 지원</span>
                  <span>업데이트 {new Date(problem.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              {problem.categories.length > 0 ? (
                <CardContent className="flex flex-wrap gap-2">
                  {problem.categories.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-xs text-slate-600">
                      #{tag}
                    </Badge>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
