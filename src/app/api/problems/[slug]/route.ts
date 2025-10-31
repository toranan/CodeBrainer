import { NextResponse } from "next/server"

import { fetchProblemDetailBySlug } from "@/server/problem-service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const problem = await fetchProblemDetailBySlug(slug)

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 })
  }

  return NextResponse.json(problem)
}
