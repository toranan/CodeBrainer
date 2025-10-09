import seedProblem from "@/../prisma/seed-data/problems.json";

// We avoid importing Prisma modules when the client hasn't been generated (e.g. DB not set up).
// Lazy-load the client to keep the app working with seed data only.
let prisma: any;

async function getPrismaClient() {
  if (prisma) return prisma;
  try {
    const { prisma: client } = await import("@/lib/prisma");
    prisma = client;
    return prisma;
  } catch (error) {
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

function normalizeSolutions(solutions: unknown): ProblemSolutionSummary[] {
  if (!Array.isArray(solutions)) return [];
  return solutions
    .map((solution) => {
      if (!solution || typeof solution !== "object") return null;
      const s = solution as Record<string, unknown>;
      if (typeof s.language !== "string") return null;
      return {
        id: typeof s.id === "string" ? s.id : undefined,
        language: toSupportedLanguage(s.language),
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
    solutions: normalizeSolutions(data.solutions).map((solution, index) => ({
      ...solution,
      id: solution.id ?? `${data.slug}-sol-${solution.language}-${index}`,
    })),
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

function getSeedProblemBySlug(slug: string): { detail: ProblemDetail; testcases: TestcaseData } | null {
  const seed = SEED_PROBLEMS.find((problem) => problem.slug === slug);
  if (!seed) return null;

  const detail = normalizeProblemDetail({
    ...seed,
    id: seed.slug,
  });
  const testcases = normalizeTestcases(seed.testcases, seed.slug);

  return { detail, testcases } as { detail: ProblemDetail; testcases: TestcaseData };
}

async function getPrismaProblemBySlug(slug: string) {
  const client = await getPrismaClient();
  if (!client) return null;
  try {
    const problem = await client.problem.findUnique({
      where: { slug },
      include: {
        hints: {
          orderBy: { stage: "asc" },
        },
        solutions: true,
        testcases: true,
      },
    });
    if (!problem) return null;

    const detail = normalizeProblemDetail(problem);
    const testcases = normalizeTestcases(problem.testcases, problem.slug);

    return { detail, testcases } as { detail: ProblemDetail; testcases: TestcaseData };
  } catch (error) {
    console.warn("Prisma 연결에 실패했습니다. Seed 데이터를 사용합니다.", error);
    return null;
  }
}

async function getPrismaProblemById(id: string) {
  const client = await getPrismaClient();
  if (!client) return null;
  try {
    const problem = await client.problem.findUnique({
      where: { id },
      include: {
        hints: {
          orderBy: { stage: "asc" },
        },
        solutions: true,
        testcases: true,
      },
    });
    if (!problem) return null;

    const detail = normalizeProblemDetail(problem);
    const testcases = normalizeTestcases(problem.testcases, problem.slug);

    return { detail, testcases } as { detail: ProblemDetail; testcases: TestcaseData };
  } catch (error) {
    console.warn("Prisma 연결에 실패했습니다. Seed 데이터를 사용합니다.", error);
    return null;
  }
}

export async function fetchProblemDetailBySlug(slug: string): Promise<ProblemDetail | null> {
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

export async function fetchHintByProblemStage(
  idOrSlug: string,
  stage: number,
): Promise<ProblemHint | null> {
  const full = await fetchProblemFullByIdOrSlug(idOrSlug);
  if (!full) return null;

  return full.detail.hints.find((hint) => hint.stage === stage) ?? null;
}

export type { TestcaseData };



