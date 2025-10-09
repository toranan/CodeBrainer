import { NextResponse } from "next/server"
import vm from "vm"

import { fetchProblemFullByIdOrSlug } from "@/server/problem-service"

interface RunRequest {
  problemId: string
  language: string
  code: string
  mode?: "run" | "submit"
}

export async function POST(request: Request) {
  const body = (await request.json()) as RunRequest

  if (!body.problemId || !body.code) {
    return NextResponse.json(
      { error: "problemId와 code는 필수입니다." },
      { status: 400 }
    )
  }

  if ((body.language ?? "").toUpperCase() !== "JAVASCRIPT") {
    return NextResponse.json(
      { error: "현재는 JavaScript만 지원합니다." },
      { status: 400 }
    )
  }

  const problem = await fetchProblemFullByIdOrSlug(body.problemId)

  if (!problem) {
    return NextResponse.json({ error: "문제를 찾을 수 없습니다." }, { status: 404 })
  }

  const scriptContent = `${body.code}\n;typeof solution === 'function' ? solution : module?.exports?.solution`

  let solution: ((...args: unknown[]) => unknown) | null = null
  let compileError: string | null = null

  try {
    const context = vm.createContext({ module: { exports: {} }, exports: {} })
    const script = new vm.Script(scriptContent, {
      timeout: 1000,
    })
    const exported = script.runInContext(context, { timeout: 1000 })
    const candidate = exported ?? context.module?.exports?.solution ?? context.solution
    if (typeof candidate !== "function") {
      throw new Error("solution 함수를 찾을 수 없습니다.")
    }
    solution = candidate as (...args: unknown[]) => unknown
  } catch (error) {
    compileError = error instanceof Error ? error.message : String(error)
  }

  if (!solution) {
    return NextResponse.json(
      {
        status: "CE",
        results: [],
        compileLog: compileError ?? "solution 함수를 찾을 수 없습니다.",
      },
      { status: 200 }
    )
  }

  const results = [] as {
    testcaseId: string
    verdict: string
    timeMs: number
    memoryKb: number
    stderr?: string
  }[]

  let hasWrong = false

  for (const testcase of problem.testcases) {
    let verdict = "AC"
    let stderr: string | undefined
    const start = performance.now()

    try {
      const inputArgs = JSON.parse(testcase.input) as unknown[]
      const expected = JSON.stringify(JSON.parse(testcase.output))
      const output = solution(...inputArgs)
      const received = JSON.stringify(output)
      if (received !== expected) {
        verdict = "WA"
        hasWrong = true
        stderr = `기대값: ${expected}, 실제값: ${received}`
      }
    } catch (error) {
      verdict = "RE"
      hasWrong = true
      stderr = error instanceof Error ? error.message : String(error)
    }

    const end = performance.now()
    results.push({
      testcaseId: testcase.id,
      verdict,
      timeMs: Math.round(end - start),
      memoryKb: 0,
      stderr,
    })

    if (body.mode === "run" && verdict !== "AC") {
      break
    }
  }

  const finalStatus = compileError
    ? "CE"
    : hasWrong
    ? results.find((item) => item.verdict === "RE")
      ? "RE"
      : "WA"
    : "AC"

  return NextResponse.json({
    status: finalStatus,
    results,
    compileLog: compileError ?? undefined,
  })
}
