import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    include: {
      hints: {
        orderBy: { stage: "asc" },
      },
      solutions: true,
      testcases: {
        select: {
          id: true,
          isHidden: true,
        },
      },
    },
  })

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 })
  }

  return NextResponse.json(problem)
}
