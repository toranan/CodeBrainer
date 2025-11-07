import seedProblem from "@/../prisma/seed-data/problems.json";
import {
  orchestratorFetch,
  type OrchestratorProblemDetail,
  type OrchestratorProblemSummary,
} from "@/server/orchestrator-client";

// We avoid importing Prisma modules when the client hasn't been generated (e.g. DB not set up).
// Lazy-load the client to keep the app working with seed data only.
let prisma: typeof import("@/lib/prisma")["prisma"] | null = null;

async function getPrismaClient() {
  if (prisma) return prisma;
  try {
    const { prisma: client } = await import("@/lib/prisma");
    prisma = client;
    return prisma;
  } catch {
    console.warn("Prisma client 사용 불가. Seed 데이터를 사용합니다.");
    return null;
  }
}

import type {
  ProblemDetail,
  ProblemHint,
  ProblemIOSample,
  ProblemSolutionSummary,
  SupportedLanguage,
} from "@/types/problem";

type SeedProblem = typeof seedProblem;

const SEED_PROBLEMS: SeedProblem[] = [seedProblem];

export interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDetail["difficulty"];
  categories: string[];
  statement: string;
  languages: SupportedLanguage[];
  createdAt: string;
  updatedAt: string;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "C",
  "CPP",
  "JAVA",
  "PYTHON",
  "JAVASCRIPT",
  "GO",
];

function toSupportedLanguage(value: unknown): SupportedLanguage {
  const upper = String(value ?? "PYTHON").toUpperCase() as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(upper) ? upper : "PYTHON";
}

function normalizeIoSample(value: unknown): ProblemIOSample {
  if (!value || typeof value !== "object") {
    return { samples: [] };
  }

  const record = value as Record<string, unknown>;
  const samplesRaw = Array.isArray(record.samples) ? record.samples : [];

  const samples = samplesRaw
    .map((sample) => {
      if (!sample || typeof sample !== "object") return null;
      const s = sample as Record<string, unknown>;
      return {
        input: typeof s.input === "string" ? s.input : "",
        output: typeof s.output === "string" ? s.output : "",
        explanation: typeof s.explanation === "string" ? s.explanation : undefined,
      };
    })
    .filter(Boolean) as ProblemIOSample["samples"];

  return {
    samples,
    inputFormat: typeof record.inputFormat === "string" ? record.inputFormat : undefined,
    outputFormat: typeof record.outputFormat === "string" ? record.outputFormat : undefined,
    notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

function normalizeHints(hints: unknown): ProblemHint[] {
  if (!Array.isArray(hints)) return [];
  return hints
    .map((hint) => {
      if (!hint || typeof hint !== "object") return null;
      const h = hint as Record<string, unknown>;
      if (typeof h.stage !== "number" || typeof h.content !== "string") return null;
      return {
        id: typeof h.id === "string" ? h.id : undefined,
        stage: h.stage,
        title: typeof h.title === "string" ? h.title : undefined,
        content: h.content,
        waitSeconds: typeof h.waitSeconds === "number" ? h.waitSeconds : 0,
      } as ProblemHint;
    })
    .filter(Boolean) as ProblemHint[];
}

function normalizeSolutions(solutions: unknown, slug?: string): ProblemSolutionSummary[] {
  if (!Array.isArray(solutions)) return [];
  return solutions
    .map((solution, index) => {
      if (!solution || typeof solution !== "object") return null;
      const s = solution as Record<string, unknown>;
      if (typeof s.language !== "string") return null;
      const language = toSupportedLanguage(s.language);
      return {
        id: typeof s.id === "string" ? s.id : `${slug ?? "sol"}-${language}-${index}`,
        language,
        note: typeof s.note === "string" ? s.note : undefined,
      } satisfies ProblemSolutionSummary;
    })
    .filter(Boolean) as ProblemSolutionSummary[];
}

function normalizeProblemDetail(data: {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  categories?: string[] | null;
  statement: string;
  ioSample: unknown;
  constraints?: string | null;
  languages?: unknown;
  hints?: unknown;
  solutions?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): ProblemDetail {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    difficulty: data.difficulty as ProblemDetail["difficulty"],
    categories: data.categories ?? [],
    statement: data.statement,
    ioSample: normalizeIoSample(data.ioSample),
    constraints: data.constraints ?? undefined,
    languages: Array.isArray(data.languages)
      ? (data.languages.map((lang) => toSupportedLanguage(lang)) as SupportedLanguage[])
      : (["PYTHON"] as SupportedLanguage[]),
    hints: normalizeHints(data.hints).map((hint, index) => ({
      ...hint,
      id: hint.id ?? `${data.slug}-hint-${hint.stage ?? index + 1}`,
    })),
    solutions: normalizeSolutions(data.solutions, data.slug),
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : data.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : data.updatedAt?.toISOString() ?? new Date().toISOString(),
  } satisfies ProblemDetail;
}

interface TestcaseData {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
}

function normalizeTestcases(testcases: unknown, slug: string): TestcaseData[] {
  if (!Array.isArray(testcases)) return [];
  return testcases
    .map((testcase, index) => {
      if (!testcase || typeof testcase !== "object") return null;
      const t = testcase as Record<string, unknown>;
      const input = typeof t.input === "string" ? t.input : "[]";
      const output = typeof t.output === "string" ? t.output : "[]";
      return {
        id: typeof t.id === "string" ? t.id : `${slug}-tc-${index + 1}`,
        input,
        output,
        isHidden: typeof t.isHidden === "boolean" ? t.isHidden : false,
      } satisfies TestcaseData;
    })
    .filter(Boolean) as TestcaseData[];
}

function getSeedProblemBySlug(slug: string): { detail: ProblemDetail; testcases: TestcaseData[] } | null {
  const seed = SEED_PROBLEMS.find((problem) => problem.slug === slug);
  if (!seed) return null;

  const detail = normalizeProblemDetail({
    ...seed,
    id: seed.slug,
  });
  const testcases = normalizeTestcases(seed.testcases, seed.slug);

  return { detail, testcases };
}

// Prisma Problem 모델은 이제 Orchestrator에서 관리합니다.
// 이 함수들은 더 이상 사용되지 않으며, Orchestrator API와 Seed 데이터만 사용합니다.
async function getPrismaProblemBySlug(slug: string) {
  // Prisma는 이제 인증(User, Account, Session)만 관리합니다.
  // Problem 데이터는 Orchestrator API를 통해 조회합니다.
  return null;
}

async function getPrismaProblemById(id: string) {
  // Prisma는 이제 인증(User, Account, Session)만 관리합니다.
  // Problem 데이터는 Orchestrator API를 통해 조회합니다.
  return null;
}

export async function fetchProblemDetailBySlug(slug: string): Promise<ProblemDetail | null> {
  try {
    const detail = await orchestratorFetch<OrchestratorProblemDetail>(`/api/problems/${slug}`);
    return mapOrchestratorDetailToProblem(detail).detail;
  } catch (error) {
    console.warn("Orchestrator 문제 상세 호출 실패. Prisma/seed로 대체합니다.", error);
  }

  const prismaProblem = await getPrismaProblemBySlug(slug);
  if (prismaProblem) {
    return prismaProblem.detail;
  }

  const seed = getSeedProblemBySlug(slug);
  return seed?.detail ?? null;
}

export async function fetchProblemFullByIdOrSlug(
  idOrSlug: string,
): Promise<{ detail: ProblemDetail; testcases: TestcaseData[] } | null> {
  try {
    const detail = await orchestratorFetch<OrchestratorProblemDetail>(`/api/problems/${idOrSlug}`);
    return mapOrchestratorDetailToProblem(detail);
  } catch (error) {
    console.warn("Orchestrator 문제 풀 호출 실패. Prisma/seed로 대체합니다.", error);
  }

  const prismaProblem = await getPrismaProblemById(idOrSlug);
  if (prismaProblem) {
    return prismaProblem;
  }

  const prismaProblemBySlug = await getPrismaProblemBySlug(idOrSlug);
  if (prismaProblemBySlug) {
    return prismaProblemBySlug;
  }

  const seed = getSeedProblemBySlug(idOrSlug);
  if (seed) {
    return { detail: seed.detail, testcases: seed.testcases };
  }

  return null;
}

export async function fetchProblemSummaries(): Promise<ProblemSummary[]> {
  try {
    const summaries = await orchestratorFetch<OrchestratorProblemSummary[]>("/api/problems");
    return summaries.map((summary) => ({
      id: String(summary.id),
      title: summary.title,
      slug: summary.slug,
      difficulty: (summary.tier?.toUpperCase?.() ?? "BRONZE") as ProblemDetail["difficulty"],
      categories: summary.categories ?? [],
      statement: summary.statement ?? "",
      languages: Array.isArray(summary.languages)
        ? (summary.languages.map((lang) => toSupportedLanguage(lang)) as SupportedLanguage[])
        : (["PYTHON"] as SupportedLanguage[]),
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    }));
  } catch (error) {
    console.warn("Orchestrator 요약 호출 실패. Prisma/seed로 대체합니다.", error);
  }

  const client = await getPrismaClient();
  if (client) {
    try {
      const problems = await client.problem.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          categories: true,
          statement: true,
          languages: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return problems.map((problem) => ({
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        categories: problem.categories ?? [],
        statement: problem.statement,
        languages: Array.isArray(problem.languages)
          ? (problem.languages.map((lang: string) => toSupportedLanguage(lang)) as SupportedLanguage[])
          : (["PYTHON"] as SupportedLanguage[]),
        createdAt:
          typeof problem.createdAt === "string"
            ? problem.createdAt
            : problem.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt:
          typeof problem.updatedAt === "string"
            ? problem.updatedAt
            : problem.updatedAt?.toISOString() ?? new Date().toISOString(),
      }));
    } catch (error) {
      console.warn("Prisma 연결에 실패했습니다. Seed 데이터를 사용합니다.", error);
    }
  }

  return SEED_PROBLEMS.map((problem) => ({
    id: problem.slug,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty as ProblemDetail["difficulty"],
    categories: problem.categories ?? [],
    statement: problem.statement,
    languages: Array.isArray(problem.languages)
      ? (problem.languages.map((lang) => toSupportedLanguage(lang)) as SupportedLanguage[])
      : (["PYTHON"] as SupportedLanguage[]),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function fetchHintByProblemStage(
  idOrSlug: string,
  stage: number,
): Promise<ProblemHint | null> {
  const full = await fetchProblemFullByIdOrSlug(idOrSlug);
  if (!full) return null;

  return full.detail.hints.find((hint) => hint.stage === stage) ?? null;
}

export type { TestcaseData };

function mapOrchestratorDetailToProblem(detail: OrchestratorProblemDetail): {
  detail: ProblemDetail;
  testcases: TestcaseData[];
} {
  const visibleSamples = Array.isArray(detail.samples)
    ? detail.samples.filter((sample) => sample.hidden === false)
    : [];

  const hints = detail.hints.map((hint, index) => ({
    id: `${detail.slug}-hint-${hint.stage ?? index + 1}`,
    stage: hint.stage,
    title: hint.title,
    content: hint.contentMd,
    waitSeconds: hint.waitSeconds,
  }));

  const testcases = detail.testcases.map((testcase, index) => ({
    id: String(testcase.id ?? `${detail.slug}-tc-${index + 1}`),
    input: testcase.input ?? "",
    output: testcase.output ?? "",
    isHidden: testcase.hidden,
  }));

  const mappedDetail: ProblemDetail = {
    id: String(detail.id),
    title: detail.title,
    slug: detail.slug,
    difficulty: (detail.tier?.toUpperCase?.() ?? "BRONZE") as ProblemDetail["difficulty"],
    categories: detail.categories ?? [],
    statement: detail.statement,
    ioSample: {
      inputFormat: detail.inputFormat ?? undefined,
      outputFormat: detail.outputFormat ?? undefined,
      samples: visibleSamples.map((sample) => ({
        input: sample.input ?? "",
        output: sample.output ?? "",
        explanation: sample.explanation ?? undefined,
      })),
    },
    constraints: detail.constraints ?? undefined,
    languages: Array.isArray(detail.languages)
      ? (detail.languages.map((lang) => toSupportedLanguage(lang)) as SupportedLanguage[])
      : (["PYTHON"] as SupportedLanguage[]),
    hints,
    solutions: [],
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };

  return { detail: mappedDetail, testcases };
}



