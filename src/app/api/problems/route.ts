import { NextRequest, NextResponse } from "next/server"

import { fetchProblemSummaries } from "@/server/problem-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const difficulty = searchParams.get("difficulty")?.toUpperCase() || undefined
  const category = searchParams.get("category") || undefined
  const q = searchParams.get("q")?.toLowerCase() || undefined

  const problems = await fetchProblemSummaries()

  const filtered = problems.filter((problem) => {
    const matchesDifficulty = difficulty ? problem.difficulty === difficulty : true
    const matchesCategory = category ? problem.categories.includes(category) : true
    const matchesQuery = q
      ? problem.title.toLowerCase().includes(q) || problem.slug.toLowerCase().includes(q)
      : true
    return matchesDifficulty && matchesCategory && matchesQuery
  })

  return NextResponse.json({ problems: filtered })
}
