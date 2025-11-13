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
    status: string;
    lang: string;
    createdAt: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
}

export async function getMyProblems(params: {
  userId: number;
  status?: string;
  page?: number;
  size?: number;
}) {
  const q = new URLSearchParams();
  q.set("userId", String(params.userId));
  if (params.status) q.set("status", params.status);
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return orchestratorFetch<PageResponse<MySolvedItem>>(`/api/me/problems?${q.toString()}`);
}

export async function getReview(params: {
  userId: number;
  baseProblemId: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  q.set("userId", String(params.userId));
  q.set("baseProblemId", String(params.baseProblemId));
  if (params.limit != null) q.set("limit", String(params.limit));
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return orchestratorFetch<{ baseProblem: any; recommendations: any[] }>(
    `/api/me/review?${q.toString()}`
  );
}

export async function getCharts(params: { userId: number; days?: number }) {
  const q = new URLSearchParams();
  q.set("userId", String(params.userId));
  if (params.days != null) q.set("days", String(params.days));
  return orchestratorFetch<{
    activityByDay: Array<{ date: string; count: number }>;
    solvedCountByTier: Array<{ tier: string; count: number }>;
    solvedCountByLevel: Array<{ level: number; count: number }>;
    languageUsage: Array<{ lang: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    overall: { attemptedProblems: number; solvedProblems: number; acRate: number };
  }>(`/api/me/charts?${q.toString()}`);
}


