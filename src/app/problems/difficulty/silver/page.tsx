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

export const dynamic = 'force-dynamic';
export const revalidate = 0; // 항상 최신 데이터 표시

export default async function SilverProblemsPage() {
  const problems = await fetchProblemSummaries()
  const silverProblems = problems.filter((p) => p.difficulty === "SILVER")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <Link href="/problems/difficulty" className="text-sm text-primary hover:underline">
          ← 난이도별 문제로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <img src="/tiers/Silver.png" alt="실버" className="w-12 h-12 object-contain" />
          <h1 className="text-3xl font-semibold text-slate-900">실버 문제</h1>
          <Badge className="bg-slate-200 text-slate-700">SILVER</Badge>
        </div>
        <p className="text-sm text-slate-600">
          중급 수준의 알고리즘 문제입니다. 기본적인 자료구조와 알고리즘 지식이 필요합니다.
        </p>
      </header>

      <div className="space-y-4">
        {silverProblems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              아직 등록된 실버 문제가 없습니다.
            </CardContent>
          </Card>
        ) : (
          silverProblems.map((problem) => (
            <Card key={problem.slug} className="border border-slate-200 transition hover:border-primary/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge className="bg-slate-200 text-slate-700">SILVER</Badge>
                    <span className="text-slate-400">·</span>
                    <span>문제 ID: {problem.slug}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    <Link href={`/problems/${problem.slug}`} className="transition hover:text-primary">
                      {problem.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {problem.statement
                      ? truncate(problem.statement.replace(/\n+/g, " "), 120)
                      : "문제 설명을 확인하려면 클릭하세요"}
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
