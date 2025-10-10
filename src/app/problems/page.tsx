import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default async function ProblemsPage() {
  const problems = await fetchProblemSummaries()

  const categories = Array.from(new Set(problems.flatMap((problem) => problem.categories))).filter(Boolean)

  const problemsByCategory: Record<string, typeof problems> = {
    전체: problems,
  }

  categories.forEach((category) => {
    problemsByCategory[category] = problems.filter((problem) => problem.categories.includes(category))
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">문제 목록</h1>
        <p className="text-sm text-slate-600">
          학습하고 싶은 문제를 선택하세요. 난이도와 태그는 빠르게 문제를 찾는 데 도움을 줍니다.
        </p>
      </header>

      <Tabs defaultValue="전체" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {Object.keys(problemsByCategory).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(problemsByCategory).map(([category, categoryProblems]) => (
          <TabsContent key={category} value={category} className="mt-6 space-y-4">
            {categoryProblems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  아직 등록된 문제가 없습니다.
                </CardContent>
              </Card>
            ) : (
              categoryProblems.map((problem) => (
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
          </TabsContent>
        ))}
      </Tabs>

      {problems.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}
    </div>
  )
}

