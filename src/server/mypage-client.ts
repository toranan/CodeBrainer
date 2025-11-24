import { orchestratorFetch } from "./orchestrator-client";

export interface MySolvedItem {
  problem: {
    id: number;
    title: string;
    tier: string;
    level: number;
    categories: string[];
  };
  lastSubmission: {
    submissionId: number;
    status: string;
    lang: string;
    createdAt: string;
    hintUsageCount?: number; // 힌트 사용량
  };
  hintUsageCount?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
}

export async function getMyProblems(params: {
  userId: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  if (params.status !== undefined) q.set("status", params.status); // 빈 문자열도 전달 가능하도록 수정
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return orchestratorFetch<PageResponse<MySolvedItem>>(`/api/me/problems?${q.toString()}`);
}

export async function getReview(params: {
  userId: string;
  baseProblemId: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  q.set("baseProblemId", String(params.baseProblemId));
  if (params.limit != null) q.set("limit", String(params.limit));
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return orchestratorFetch<{ baseProblem: any; recommendations: any[] }>(
    `/api/me/review?${q.toString()}`
  );
}

export interface Overall {
  attemptedProblems: number;
  solvedProblems: number;
  acRate: number;
  solvedLast7Days: number;
  solvedLast30Days: number;
}

export async function getCharts(params: { userId: string; days?: number }) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  if (params.days != null) q.set("days", String(params.days));
  return orchestratorFetch<{
    activityByDay: Array<{ date: string; count: number }>;
    solvedCountByTier: Array<{ tier: string; count: number }>;
    solvedCountByLevel: Array<{ level: number; count: number }>;
    languageUsage: Array<{ lang: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    overall: Overall;
  }>(`/api/me/charts?${q.toString()}`);
}

export async function getGrowthTrend(params: {
  userId: string;
  tier?: string;
  level?: number;
  days?: number;
}) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  if (params.tier) q.set("tier", params.tier);
  if (params.level != null) q.set("level", String(params.level));
  if (params.days != null) q.set("days", String(params.days));
  return orchestratorFetch<{ points: Array<{ date: string; count: number }>; totalHints: number }>(
    `/api/me/growth?${q.toString()}`
  );
}

export interface WeakCategoryStats {
  category: string;
  totalProblems: number;
  correctProblems: number;
  accuracy: number; // 0.0 ~ 1.0
}

export interface WrongProblemItem {
  problemId: number;
  title: string;
  slug: string;
  tier: string;
  level: number;
  categories: string[];
  attemptCount: number;
  lastAttemptAt: string;
}

export async function getWeakCategories(params: { userId: string }) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  return orchestratorFetch<WeakCategoryStats[]>(`/api/me/review/weak-categories?${q.toString()}`);
}

export async function getWrongProblems(params: { userId: string }) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  return orchestratorFetch<WrongProblemItem[]>(`/api/me/review/wrong-problems?${q.toString()}`);
}

export interface AIRecommendationResponse {
  recommendations: Array<{
    id: number;
    title: string;
    slug: string;
    tier: string;
    level: number;
    categories: string[];
  }>;
  reason: string;
}

export async function getAIRecommendations(params: { userId: string; limit?: number }) {
  const q = new URLSearchParams();
  q.set("userId", params.userId);
  if (params.limit != null) q.set("limit", String(params.limit));
  return orchestratorFetch<AIRecommendationResponse>(`/api/me/ai-recommendations?${q.toString()}`);
}


