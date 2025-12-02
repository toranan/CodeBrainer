import { NextResponse } from "next/server"
import { orchestratorFetch } from "@/server/orchestrator-client"

interface HintRequest {
    submissionId: number
    userCode: string
    language: string
    problemId: string
    verdict: string
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
 * Gemini AI 힌트 텍스트를 파싱하여 프론트엔드 형식으로 변환
 */
function parseHintContent(hintContent: string) {
    const hints: string[] = []
    const suggestions: string[] = []

    // 1. 문제점 분석 섹션 추출
    const problemMatch = hintContent.match(/###\s*문제점\s*분석\s*[:：]?\s*([\s\S]*?)(?=###|$)/i)
    if (problemMatch) {
        const lines = problemMatch[1].trim().split('\n').filter(line => line.trim())
        lines.forEach(line => {
            const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim()
            if (cleaned && !cleaned.startsWith('#')) hints.push(cleaned)
        })
    }

    // 2. 다시 생각해볼 점 섹션 추출
    const thinkMatch = hintContent.match(/###\s*다시\s*생각해볼\s*점\s*[:：]?\s*([\s\S]*?)(?=###|$)/i)
    if (thinkMatch) {
        const lines = thinkMatch[1].trim().split('\n').filter(line => line.trim())
        lines.forEach(line => {
            const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim()
            if (cleaned && !cleaned.startsWith('#')) suggestions.push(cleaned)
        })
    }

    // 기본값 제공
    if (hints.length === 0) {
        hints.push("코드를 다시 한 번 검토해보세요.")
    }
    if (suggestions.length === 0) {
        suggestions.push("문제 조건을 다시 읽어보세요.")
    }

    return {
        hints,
        suggestions,
    }
}

export async function POST(request: Request) {
    const body = (await request.json()) as HintRequest

    if (!body.submissionId || !body.userCode || !body.language) {
        return NextResponse.json(
            { error: "submissionId, userCode, language는 필수입니다." },
            { status: 400 }
        )
    }

    try {
        // Orchestrator API로 힌트 생성 요청 (mode=hint 플래그 사용)
        let codeReview: CodeReviewResponse

        try {
            // 먼저 기존 힌트가 있는지 확인
            codeReview = await orchestratorFetch<CodeReviewResponse>(
                `/api/code-reviews/submissions/${body.submissionId}?mode=hint`
            )
        } catch (error) {
            // 힌트가 없으면 생성
            console.log("힌트가 없어서 새로 생성합니다:", body.submissionId)
            codeReview = await orchestratorFetch<CodeReviewResponse>(
                `/api/code-reviews/submissions/${body.submissionId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mode: "hint",
                        verdict: body.verdict,
                    }),
                }
            )
        }

        // Gemini 힌트 텍스트를 프론트엔드 형식으로 변환
        const parsedHint = parseHintContent(codeReview.reviewContent)

        return NextResponse.json(parsedHint)
    } catch (error) {
        console.error("AI 힌트 조회/생성 오류:", error)
        return NextResponse.json(
            {
                error: "AI 힌트를 가져오는데 실패했습니다.",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}
