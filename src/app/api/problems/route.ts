import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const difficulty = searchParams.get("difficulty") || undefined
  const category = searchParams.get("category") || undefined
  const q = searchParams.get("q") || undefined

  const problems = await prisma.problem.findMany({
    where: {
      difficulty,
      categories: category ? { has: category } : undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      categories: true,
      createdAt: true,
      updatedAt: true,
      languages: true,
    },
  })

  return NextResponse.json({ problems })
}
