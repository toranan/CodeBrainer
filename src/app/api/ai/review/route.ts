import { NextResponse } from "next/server"
import { orchestratorFetch } from "@/server/orchestrator-client"

interface ReviewRequest {
  userCode: string
  language: string
  problemId: string
  submissionId?: number
}

interface CodeReviewResponse {
  reviewId: number
  submissionId: number
  reviewContent: string
  rating: number | null
  suggestions: string | null
  createdAt: string
}

/**
 * Gemini AI 리뷰 텍스트를 파싱하여 프론트엔드 형식으로 변환
 */
function parseReviewContent(reviewContent: string, code: string, language: string) {
  const improvements: string[] = []
  const altApproaches: string[] = []

  // 개선사항 섹션 추출
  const improvementsMatch = reviewContent.match(/개선.*?[:：]([\s\S]*?)(?=\n\n|\d\.|\z)/i)
  if (improvementsMatch) {
    const lines = improvementsMatch[1].trim().split('\n').filter(line => line.trim())
    lines.forEach(line => {
      const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim()
      if (cleaned) improvements.push(cleaned)
    })
  }

  // 대안적 접근 섹션 추출
  const altMatch = reviewContent.match(/(?:대안|다른 방법|alternative).*?[:：]([\s\S]*?)(?=\n\n|\d\.|\z)/i)
  if (altMatch) {
    const lines = altMatch[1].trim().split('\n').filter(line => line.trim())
    lines.forEach(line => {
      const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim()
      if (cleaned) altApproaches.push(cleaned)
    })
  }

  // 기본값 제공
  if (improvements.length === 0) {
    improvements.push("AI가 코드를 분석했습니다.")
  }
  if (altApproaches.length === 0) {
    altApproaches.push("전체 리뷰 내용을 참고해주세요.")
  }

  return {
    improvements,
    altApproaches,
    finalSolution: {
      language,
      code,
      notes: reviewContent,
    },
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest

  if (!body.userCode || !body.language || !body.problemId) {
    return NextResponse.json(
      { error: "userCode, language, problemId는 필수입니다." },
      { status: 400 }
    )
  }

  // submissionId가 있으면 해당 제출에 대한 리뷰 조회/생성
  if (body.submissionId) {
    try {
      // 먼저 기존 리뷰가 있는지 확인
      let codeReview: CodeReviewResponse

      try {
        codeReview = await orchestratorFetch<CodeReviewResponse>(
          `/api/code-reviews/submissions/${body.submissionId}`
        )
      } catch (error) {
        // 리뷰가 없으면 생성
        console.log("리뷰가 없어서 새로 생성합니다:", body.submissionId)
        codeReview = await orchestratorFetch<CodeReviewResponse>(
          `/api/code-reviews/submissions/${body.submissionId}`,
          {
            method: "POST",
          }
        )
      }

      // Gemini 리뷰 텍스트를 프론트엔드 형식으로 변환
      const parsedReview = parseReviewContent(
        codeReview.reviewContent,
        body.userCode,
        body.language
      )

      return NextResponse.json(parsedReview)
    } catch (error) {
      console.error("코드 리뷰 조회/생성 오류:", error)
      return NextResponse.json(
        {
          error: "AI 리뷰를 가져오는데 실패했습니다.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    }
  }

  // submissionId가 없으면 기본 응답 반환 (임시)
  return NextResponse.json({
    improvements: [
      "제출이 완료된 후 AI 리뷰를 확인할 수 있습니다.",
    ],
    altApproaches: [
      "코드를 제출하면 더 자세한 피드백을 받을 수 있습니다.",
    ],
    finalSolution: {
      language: body.language,
      code: body.userCode,
      notes: "제출 후 AI 리뷰를 받으세요.",
    },
  })
}
