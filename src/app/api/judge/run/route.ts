import { NextResponse } from "next/server"

import { fetchProblemFullByIdOrSlug } from "@/server/problem-service"
import {
  createBatchSubmissions,
  LANGUAGE_ID_MAP,
  mapStatusToVerdict,
  waitForBatchSubmissions,
  type Judge0Submission,
} from "@/server/judge0-client"

interface RunRequest {
  problemId: string
  language: string
  code: string
  mode?: "run" | "submit"
}

export async function POST(request: Request) {
  const body = (await request.json()) as RunRequest

  if (!body.problemId || !body.code) {
    return NextResponse.json({ error: "problemId와 code는 필수입니다." }, { status: 400 })
  }

  const languageUpper = (body.language ?? "").toUpperCase()
  const languageId = LANGUAGE_ID_MAP[languageUpper]

  if (!languageId) {
    return NextResponse.json(
      {
        error: `지원하지 않는 언어입니다: ${body.language}. 지원 언어: ${Object.keys(LANGUAGE_ID_MAP).join(", ")}`,
      },
      { status: 400 },
    )
  }

  const problem = await fetchProblemFullByIdOrSlug(body.problemId)

  if (!problem) {
    return NextResponse.json({ error: "문제를 찾을 수 없습니다." }, { status: 404 })
  }

  // run 모드일 경우 첫 번째 테스트케이스만, submit 모드일 경우 모든 테스트케이스
  const testcasesToRun =
    body.mode === "run" ? problem.testcases.slice(0, 1) : problem.testcases

  // Judge0 제출 생성
  const submissions: Judge0Submission[] = testcasesToRun.map((testcase) => ({
    source_code: body.code,
    language_id: languageId,
    stdin: testcase.input,
    expected_output: testcase.output,
    cpu_time_limit: 2.0, // 2초
    wall_time_limit: 5.0, // 5초
    memory_limit: 256000, // 256MB (kilobytes)
  }))

  try {
    // 배치 제출 생성
    const tokens = await createBatchSubmissions(submissions)

    // 결과 대기 (최대 30초)
    const judge0Results = await waitForBatchSubmissions(
      tokens.map((t) => t.token),
      30,
      1000,
    )

    // 결과 변환
    const results = judge0Results.map((result, index) => {
      const verdict = mapStatusToVerdict(result.status.id)
      const testcase = testcasesToRun[index]

      return {
        testcaseId: testcase.id,
        verdict,
        timeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
        memoryKb: result.memory ?? 0,
        stderr: result.stderr ?? result.message ?? undefined,
        stdout: result.stdout ?? undefined,
        compileOutput: result.compile_output ?? undefined,
      }
    })

    // 전체 상태 결정
    let finalStatus = "AC"
    const hasCompileError = results.some((r) => r.verdict === "CE")
    const hasRuntimeError = results.some((r) => r.verdict === "RE")
    const hasWrongAnswer = results.some((r) => r.verdict === "WA")
    const hasTimeLimitExceeded = results.some((r) => r.verdict === "TLE")

    if (hasCompileError) {
      finalStatus = "CE"
    } else if (hasRuntimeError) {
      finalStatus = "RE"
    } else if (hasTimeLimitExceeded) {
      finalStatus = "TLE"
    } else if (hasWrongAnswer) {
      finalStatus = "WA"
    }

    // 컴파일 로그 추출
    const compileLog = results.find((r) => r.compileOutput)?.compileOutput

    return NextResponse.json({
      status: finalStatus,
      results,
      compileLog,
    })
  } catch (error) {
    console.error("Judge0 채점 오류:", error)
    return NextResponse.json(
      {
        error: "채점 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
