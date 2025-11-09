import { NextResponse } from "next/server"

import { fetchProblemFullByIdOrSlug } from "@/server/problem-service"
import {
  createBatchSubmissions,
  LANGUAGE_ID_MAP,
  mapStatusToVerdict,
  waitForBatchSubmissions,
  type Judge0Submission,
} from "@/server/judge0-client"
import { orchestratorFetch } from "@/server/orchestrator-client"

interface RunRequest {
  problemId: string
  language: string
  code: string
  mode?: "run" | "submit"
}

interface OrchestratorSubmissionResponse {
  submissionId: number
  status: string
}

interface OrchestratorSubmissionDetail {
  submissionId: number
  status: string
  result: {
    compile: {
      ok: boolean
      message: string | null
    }
    summary: string
    tests: string
  } | null
}

// Orchestrator API로 제출 생성 및 결과 폴링
async function submitToOrchestrator(
  problemId: number,
  langId: string,
  code: string,
): Promise<OrchestratorSubmissionDetail> {
  // 1. 제출 생성
  const createResponse = await orchestratorFetch<OrchestratorSubmissionResponse>(
    "/api/submissions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problemId,
        langId,
        code,
      }),
    },
  )

  const submissionId = createResponse.submissionId

  // 2. 제출 완료까지 폴링 (최대 60초)
  const maxAttempts = 60
  const pollInterval = 1000 // 1초

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const detail = await orchestratorFetch<OrchestratorSubmissionDetail>(
      `/api/submissions/${submissionId}`,
    )

    // COMPLETED 상태면 결과 반환
    if (detail.status === "COMPLETED") {
      return detail
    }

    // QUEUED, RUNNING 상태면 계속 대기
    if (detail.status === "QUEUED" || detail.status === "RUNNING") {
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      continue
    }

    // 기타 상태 (에러 등)면 즉시 반환
    return detail
  }

  // 타임아웃 시 마지막 상태 반환
  return await orchestratorFetch<OrchestratorSubmissionDetail>(
    `/api/submissions/${submissionId}`,
  )
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

  // submit 모드일 경우 Orchestrator API 사용
  if (body.mode === "submit") {
    try {
      // problem.detail.id를 숫자로 변환 (Orchestrator는 숫자 ID 필요)
      const problemNumericId = parseInt(problem.detail.id, 10)
      if (isNaN(problemNumericId)) {
        return NextResponse.json(
          { error: "문제 ID를 숫자로 변환할 수 없습니다." },
          { status: 400 },
        )
      }

      const orchestratorDetail = await submitToOrchestrator(
        problemNumericId,
        languageUpper,
        body.code,
      )

      // Orchestrator 응답을 프론트엔드 형식으로 변환
      return formatOrchestratorResponse(orchestratorDetail, problem.testcases)
    } catch (error) {
      console.error("Orchestrator 제출 오류:", error)
      return NextResponse.json(
        {
          error: "제출 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  }

  // run 모드는 기존 로직 유지 (빠른 피드백을 위해 Judge0 직접 호출)
  const testcasesToRun = problem.testcases.slice(0, 1)

  const submissions: Judge0Submission[] = testcasesToRun.map((testcase) => ({
    source_code: body.code,
    language_id: languageId,
    stdin: testcase.input,
    expected_output: testcase.output,
    cpu_time_limit: 2.0,
    wall_time_limit: 5.0,
    memory_limit: 256000,
  }))

  try {
    const tokens = await createBatchSubmissions(submissions)
    const judge0Results = await waitForBatchSubmissions(
      tokens.map((t) => t.token),
      30,
      1000,
    )

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

// Orchestrator 응답을 프론트엔드 형식으로 변환
function formatOrchestratorResponse(
  detail: OrchestratorSubmissionDetail,
  testcases: Array<{ id: string }>,
): NextResponse {
  if (!detail.result) {
    return NextResponse.json({
      status: detail.status,
      results: [],
      compileLog: null,
    })
  }

  // JSON 문자열 파싱
  type TestResult = {
    testcaseId?: string
    verdict?: string
    timeMs?: number
    memoryKb?: number
    stderr?: string
    stdout?: string
  }

  let tests: TestResult[] = []

  try {
    tests = typeof detail.result.tests === "string"
      ? JSON.parse(detail.result.tests)
      : detail.result.tests
  } catch (e) {
    console.error("결과 파싱 오류:", e)
  }

  // 테스트 결과 매핑
  const results = tests.map((test: TestResult, index: number) => {
    const testcaseId = test.testcaseId ?? testcases[index]?.id ?? `test-${index + 1}`
    return {
      testcaseId,
      verdict: test.verdict ?? "PENDING",
      timeMs: test.timeMs ?? 0,
      memoryKb: test.memoryKb ?? 0,
      stderr: test.stderr ?? undefined,
      stdout: test.stdout ?? undefined,
    }
  })

  // 최종 상태 결정
  let finalStatus = "AC"
  if (!detail.result.compile.ok) {
    finalStatus = "CE"
  } else if (results.some((r) => r.verdict === "WA")) {
    finalStatus = "WA"
  } else if (results.some((r) => r.verdict === "TLE")) {
    finalStatus = "TLE"
  } else if (results.some((r) => r.verdict === "RE")) {
    finalStatus = "RE"
  } else if (results.some((r) => r.verdict === "MLE")) {
    finalStatus = "MLE"
  }

  return NextResponse.json({
    status: finalStatus,
    results,
    compileLog: detail.result.compile.message ?? undefined,
  })
}
