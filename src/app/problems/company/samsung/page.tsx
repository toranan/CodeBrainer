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
  }

  const className = map[difficulty] ?? "bg-slate-200 text-slate-700"

  return <Badge className={className}>{difficulty}</Badge>
}

export default async function SamsungProblemsPage() {
  const problems = await fetchProblemSummaries()
  const samsungProblems = problems.filter((p) => p.categories.includes("삼성"))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <Link href="/problems/company" className="text-sm text-primary hover:underline">
          ← 기업별 기출 문제로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏢</span>
          <h1 className="text-3xl font-semibold text-slate-900">삼성 기출 문제</h1>
          <Badge className="bg-blue-100 text-blue-800">SAMSUNG</Badge>
        </div>
        <p className="text-sm text-slate-600">
          삼성전자 SW역량테스트 기출문제입니다.
        </p>
      </header>

      <div className="space-y-4">
        {samsungProblems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              아직 등록된 삼성 기출 문제가 없습니다.
            </CardContent>
          </Card>
        ) : (
          samsungProblems.map((problem) => (
            <Card key={problem.slug} className="border border-slate-200 transition hover:border-primary/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span className="text-slate-400">·</span>
                    <span>문제 ID: {problem.slug}</span>
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
