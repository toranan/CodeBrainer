import { NextResponse } from "next/server"

import { fetchHintByProblemStage } from "@/server/problem-service"

interface HintOpenRequest {
  problemId: string
  stage: number
}

export async function POST(request: Request) {
  const body = (await request.json()) as HintOpenRequest

  if (!body.problemId || typeof body.stage !== "number") {
    return NextResponse.json(
      { error: "problemId와 stage는 필수입니다." },
      { status: 400 }
    )
  }

  const hint = await fetchHintByProblemStage(body.problemId, body.stage)

  if (!hint) {
    return NextResponse.json({ error: "해당 힌트를 찾을 수 없습니다." }, { status: 404 })
  }

  // TODO: 사용자별 힌트 오픈 기록을 저장해야 정확한 대기시간을 체크할 수 있음.
  // 현재는 항상 허용하는 임시 구현.
  return NextResponse.json({
    allowed: true,
    hint,
  })
}
