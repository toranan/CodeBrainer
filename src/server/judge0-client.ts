const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL ?? "http://localhost:2358";

// Judge0 언어 ID 매핑
// 전체 목록: https://github.com/judge0/judge0/blob/master/CHANGELOG.md#additional-languages
export const LANGUAGE_ID_MAP: Record<string, number> = {
  C: 50, // C (GCC 9.2.0)
  CPP: 54, // C++ (GCC 9.2.0)
  JAVA: 62, // Java (OpenJDK 13.0.1)
  PYTHON: 71, // Python (3.8.1)
  JAVASCRIPT: 63, // JavaScript (Node.js 12.14.0)
  GO: 60, // Go (1.13.5)
  RUST: 73, // Rust (1.40.0)
  CSHARP: 51, // C# (Mono 6.6.0.161)
  RUBY: 72, // Ruby (2.7.0)
  SWIFT: 83, // Swift (5.2.3)
  KOTLIN: 78, // Kotlin (1.3.70)
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number; // seconds (float)
  wall_time_limit?: number; // seconds (float)
  memory_limit?: number; // kilobytes
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
}

export interface Judge0Result {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null; // CPU time in seconds
  memory: number | null; // Memory in kilobytes
}

// Judge0 Status IDs
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

/**
 * Judge0에 제출을 생성합니다.
 */
export async function createSubmission(submission: Judge0Submission): Promise<string> {
  const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 제출 생성 실패: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

/**
 * Judge0에 배치 제출을 생성합니다.
 */
export async function createBatchSubmissions(
  submissions: Judge0Submission[],
): Promise<{ token: string }[]> {
  const response = await fetch(
    `${JUDGE0_BASE_URL}/submissions/batch?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissions }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 배치 제출 생성 실패: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as { token: string }[];
}

/**
 * Judge0 제출 결과를 조회합니다.
 */
export async function getSubmission(token: string): Promise<Judge0Result> {
  const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 결과 조회 실패: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as Judge0Result;
}

/**
 * Judge0 배치 제출 결과를 조회합니다.
 */
export async function getBatchSubmissions(tokens: string[]): Promise<{ submissions: Judge0Result[] }> {
  const tokenParam = tokens.join(",");
  const response = await fetch(
    `${JUDGE0_BASE_URL}/submissions/batch?tokens=${tokenParam}&base64_encoded=false`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 배치 결과 조회 실패: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as { submissions: Judge0Result[] };
}

/**
 * 제출이 완료될 때까지 대기합니다 (폴링).
 */
export async function waitForSubmission(
  token: string,
  maxAttempts = 30,
  interval = 1000,
): Promise<Judge0Result> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmission(token);
    const statusId = result.status.id;

    // 처리 중이 아니면 반환
    if (statusId !== JUDGE0_STATUS.IN_QUEUE && statusId !== JUDGE0_STATUS.PROCESSING) {
      return result;
    }

    // 대기
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Judge0 제출 처리 시간 초과");
}

/**
 * 배치 제출이 모두 완료될 때까지 대기합니다.
 */
export async function waitForBatchSubmissions(
  tokens: string[],
  maxAttempts = 30,
  interval = 1000,
): Promise<Judge0Result[]> {
  for (let i = 0; i < maxAttempts; i++) {
    const { submissions } = await getBatchSubmissions(tokens);

    // 모든 제출이 완료되었는지 확인
    const allCompleted = submissions.every(
      (submission) =>
        submission.status.id !== JUDGE0_STATUS.IN_QUEUE &&
        submission.status.id !== JUDGE0_STATUS.PROCESSING,
    );

    if (allCompleted) {
      return submissions;
    }

    // 대기
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Judge0 배치 제출 처리 시간 초과");
}

/**
 * Judge0 status ID를 우리 시스템의 verdict로 변환합니다.
 */
export function mapStatusToVerdict(statusId: number): string {
  switch (statusId) {
    case JUDGE0_STATUS.ACCEPTED:
      return "AC";
    case JUDGE0_STATUS.WRONG_ANSWER:
      return "WA";
    case JUDGE0_STATUS.TIME_LIMIT_EXCEEDED:
      return "TLE";
    case JUDGE0_STATUS.COMPILATION_ERROR:
      return "CE";
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT:
    case JUDGE0_STATUS.RUNTIME_ERROR_NZEC:
    case JUDGE0_STATUS.RUNTIME_ERROR_OTHER:
      return "RE";
    case JUDGE0_STATUS.INTERNAL_ERROR:
    case JUDGE0_STATUS.EXEC_FORMAT_ERROR:
      return "IE"; // Internal Error
    default:
      return "Unknown";
  }
}
