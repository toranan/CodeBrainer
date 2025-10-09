import { NextResponse } from "next/server"

interface ReviewRequest {
  userCode: string
  language: string
  problemId: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest

  if (!body.userCode || !body.language || !body.problemId) {
    return NextResponse.json(
      { error: "userCode, language, problemId는 필수입니다." },
      { status: 400 }
    )
  }

  // TODO: 실제 모범답안 비교 및 외부 AI 호출 로직 추가
  return NextResponse.json({
    improvements: [
      "코드가 문제 요구사항을 만족합니다.",
      "시간 복잡도가 O(n)으로 적절합니다.",
    ],
    altApproaches: [
      "스택을 활용한 풀이도 동일한 결과를 얻을 수 있습니다.",
      "reduce 함수를 사용한 함수형 접근을 고려해 보세요.",
    ],
    finalSolution: {
      language: body.language,
      code: body.userCode,
      notes: "임시 AI 리뷰 응답입니다.",
    },
  })
}
