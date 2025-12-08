export type SupportedLanguage =
  | "C"
  | "CPP"
  | "JAVA"
  | "PYTHON"
  | "JAVASCRIPT"
  | "GO";

export type Difficulty = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface ProblemHint {
  id: string;
  stage: number;
  title?: string | null;
  content: string;
  waitSeconds: number;
}

export interface ProblemSolutionSummary {
  id: string;
  language: SupportedLanguage;
  note?: string | null;
}

export interface ProblemStatementData {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemIOSample {
  samples: ProblemStatementData[];
  inputFormat?: string;
  outputFormat?: string;
  notes?: string;
}

export interface ProblemDetail {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  categories: string[];
  statement: string;
  ioSample: ProblemIOSample;
  constraints?: string | null;
  languages: SupportedLanguage[];
  hints: ProblemHint[];
  solutions: ProblemSolutionSummary[];
  isVisible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionResultItem {
  testcaseId: string;
  verdict: "AC" | "WA" | "TLE" | "RE" | "CE";
  timeMs: number;
  memoryKb: number;
  stderr?: string;
}

export interface JudgeRunResponse {
  status: "PENDING" | "AC" | "WA" | "TLE" | "RE" | "CE";
  results: SubmissionResultItem[];
  compileLog?: string;
  submissionId?: number;
}

export interface HintOpenResponse {
  allowed: boolean;
  hint?: ProblemHint;
  remainingSeconds?: number;
}

export interface AiReviewResponse {
  improvements: string[];
  altApproaches: string[];
  finalSolution: {
    language: SupportedLanguage;
    code: string;
    notes?: string;
  };
}

