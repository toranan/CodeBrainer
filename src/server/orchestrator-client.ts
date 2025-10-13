
const orchestratorBaseUrl = process.env.ORCHESTRATOR_BASE_URL ?? "http://localhost:8080";

async function orchestratorFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${orchestratorBaseUrl}${path}`;
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Orchestrator 요청 실패: ${response.status}`);
  }
  return (await response.json()) as T;
}

export interface OrchestratorProblemSummary {
  id: number;
  slug: string;
  title: string;
  tier: string;
  level: number;
  categories: string[];
  languages: string[];
  statement: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrchestratorProblemDetail {
  id: number;
  slug: string;
  title: string;
  tier: string;
  level: number;
  statement: string;
  constraints?: string | null;
  inputFormat?: string | null;
  outputFormat?: string | null;
  categories: string[];
  languages: string[];
  hints: Array<{
    stage: number;
    title?: string | null;
    contentMd: string;
    waitSeconds: number;
  }>;
  testcases: Array<{
    id: number;
    caseNo: number;
    input: string;
    output: string;
    hidden: boolean;
    explanation?: string | null;
  }>;
  samples: Array<{
    id: number;
    caseNo: number;
    input: string;
    output: string;
    hidden: boolean;
    explanation?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export { orchestratorFetch };
