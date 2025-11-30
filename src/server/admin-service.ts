import { orchestratorFetch } from "@/server/orchestrator-client";
import { supabaseAdmin } from "@/lib/supabase";

export interface AdminDashboardStats {
  totalUsers: number;
  totalProblems: number;
  todaySubmissions: number;
  activeUsers24h: number;
  topProblems: PopularProblem[];
  recentActivities: RecentActivity[];
}

export interface PopularProblem {
  problemId: number;
  title: string;
  slug: string;
  tier: string;
  level: number;
  submissionCount: number;
}

export interface RecentActivity {
  userId: string;
  userName: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  solvedCount: number;
  submissionCount: number;
  createdAt: string;
}

export interface AdminProblem {
  id: number;
  title: string;
  slug: string;
  tier: string;
  level: number;
  visibility: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

function buildQuery(params: PaginationParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) {
    search.set("page", params.page.toString());
  }
  if (params.size !== undefined) {
    search.set("size", params.size.toString());
  }
  if (params.sort) {
    search.set("sort", params.sort);
  }
  return search.toString();
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  return orchestratorFetch<AdminDashboardStats>("/api/admin/dashboard/stats");
}

// Fetch users directly from Supabase
export async function fetchAdminUsers(params: PaginationParams): Promise<PageResponse<AdminUser>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  try {
    // Get total count
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const totalElements = count ?? 0;
    const totalPages = Math.ceil(totalElements / size);

    // Get paginated data
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .range(page * size, (page + 1) * size - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchAdminUsers] Supabase error:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const content: AdminUser[] = (data ?? []).map(user => ({
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? 'Unknown',
      role: user.role ?? 'USER',
      solvedCount: 0, // TODO: Calculate from submissions
      submissionCount: 0, // TODO: Calculate from submissions
      createdAt: user.created_at ?? new Date().toISOString(),
    }));

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
    };
  } catch (error) {
    console.error('[fetchAdminUsers] Error:', error);
    throw error;
  }
}

// Fetch problems directly from Supabase
export async function fetchAdminProblems(
  params: PaginationParams,
): Promise<PageResponse<AdminProblem>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  try {
    // Get total count
    const { count } = await supabaseAdmin
      .from('problems')
      .select('*', { count: 'exact', head: true });

    const totalElements = count ?? 0;
    const totalPages = Math.ceil(totalElements / size);

    // Get paginated data
    const { data, error } = await supabaseAdmin
      .from('problems')
      .select('id, title, slug, tier, level, visibility, categories, created_at, updated_at')
      .range(page * size, (page + 1) * size - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchAdminProblems] Supabase error:', error);
      throw new Error(`Failed to fetch problems: ${error.message}`);
    }

    const content: AdminProblem[] = (data ?? []).map(problem => ({
      id: problem.id,
      title: problem.title ?? 'Untitled',
      slug: problem.slug ?? '',
      tier: problem.tier ?? 'Bronze',
      level: problem.level ?? 1,
      visibility: problem.visibility ?? 'PRIVATE',
      categories: problem.categories ?? [],
      createdAt: problem.created_at ?? new Date().toISOString(),
      updatedAt: problem.updated_at ?? new Date().toISOString(),
    }));

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
    };
  } catch (error) {
    console.error('[fetchAdminProblems] Error:', error);
    throw error;
  }
}

export async function deleteAdminProblem(problemId: number): Promise<void> {
  await orchestratorFetch<void>(`/internal/problems/${problemId}`, {
    method: "DELETE",
  });
}
