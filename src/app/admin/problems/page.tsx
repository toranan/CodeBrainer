"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  FileText,
  TestTube,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { supabaseDirect } from "@/lib/supabase-direct";

interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  level: number;
  visibility: string;
  categories: string[];
  languages: string[];
  time_ms: number;
  mem_mb: number;
  created_at: string;
  updated_at: string;
}

function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    BRONZE: "bg-amber-100 text-amber-800",
    SILVER: "bg-slate-200 text-slate-700",
    GOLD: "bg-yellow-100 text-yellow-700",
    PLATINUM: "bg-emerald-100 text-emerald-700",
    DIAMOND: "bg-indigo-100 text-indigo-700",
  };
  return colors[difficulty] || "bg-slate-200 text-slate-700";
}

export default function AdminProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabaseDirect.from('problems').select();

      if (error) {
        throw new Error(error.message);
      }

      // categories와 languages를 배열로 파싱
      const processedData = (data || []).map((problem: Record<string, unknown>) => ({
        ...problem,
        categories: typeof problem.categories === 'string' 
          ? JSON.parse(problem.categories) 
          : (problem.categories || []),
        languages: typeof problem.languages === 'string'
          ? JSON.parse(problem.languages)
          : (problem.languages || []),
      }));

      setProblems(processedData);
      toast.success(`${processedData.length}개의 문제를 불러왔습니다`);
    } catch (error) {
      console.error("문제 목록 조회 실패:", error);
      toast.error("문제 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (problemId: number, currentVisibility: string) => {
    try {
      const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      
      const { error } = await supabaseDirect.from('problems').update(problemId, {
        visibility: newVisibility
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`문제를 ${newVisibility === 'PUBLIC' ? '공개' : '비공개'}로 변경했습니다`);
      fetchProblems();
    } catch (error) {
      console.error("공개 상태 변경 실패:", error);
      toast.error("공개 상태 변경에 실패했습니다");
    }
  };

  const handleDeleteProblem = async (problemId: number, title: string) => {
    if (!confirm(`"${title}" 문제를 삭제하시겠습니까?\n관련된 모든 데이터(힌트, 테스트케이스, 제출 내역)도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const { error } = await supabaseDirect.from('problems').delete(problemId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("문제가 삭제되었습니다");
      fetchProblems();
    } catch (error) {
      console.error("문제 삭제 실패:", error);
      toast.error("문제 삭제에 실패했습니다");
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "ALL" || problem.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">문제 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">문제 관리</h1>
          <p className="text-slate-600">전체 {problems.length}개의 문제 (Supabase 직접 연동)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProblems}>
            새로고침
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/admin/problems/new">
              <Plus className="mr-2 h-4 w-4" />
              새 문제 등록
            </Link>
          </Button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="문제 제목 또는 ID로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "BRONZE", "SILVER", "GOLD", "PLATINUM"].map((tier) => (
                <Button
                  key={tier}
                  variant={filterDifficulty === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterDifficulty(tier)}
                >
                  {tier === "ALL" ? "전체" : tier}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>문제 목록 ({filteredProblems.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">제목</th>
                  <th className="pb-3 font-semibold">난이도</th>
                  <th className="pb-3 font-semibold">카테고리</th>
                  <th className="pb-3 font-semibold">시간/메모리</th>
                  <th className="pb-3 font-semibold">상태</th>
                  <th className="pb-3 font-semibold text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {searchQuery || filterDifficulty !== "ALL"
                        ? "검색 결과가 없습니다."
                        : "등록된 문제가 없습니다."}
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="border-b hover:bg-slate-50">
                      <td className="py-4">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs">
                          {problem.slug}
                        </code>
                      </td>
                      <td className="py-4">
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-xs text-slate-500">
                          ID: {problem.id}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty} {problem.level}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {cat}
                            </span>
                          ))}
                          {problem.categories.length > 2 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              +{problem.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-600">
                        {problem.time_ms}ms / {problem.mem_mb}MB
                      </td>
                      <td className="py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(problem.id, problem.visibility)}
                        >
                          {problem.visibility === "PUBLIC" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Eye className="mr-1 h-3 w-3" />
                              공개
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-800">
                              <EyeOff className="mr-1 h-3 w-3" />
                              비공개
                            </Badge>
                          )}
                        </Button>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="문제 보기"
                          >
                            <Link href={`/problems/${problem.slug}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="힌트 관리"
                          >
                            <Link href={`/admin/hints?problemId=${problem.id}`}>
                              <Lightbulb className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="테스트케이스 관리"
                          >
                            <Link href={`/admin/testcases?problemId=${problem.id}`}>
                              <TestTube className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="문제 수정"
                          >
                            <Link href={`/admin/problems/${problem.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProblem(problem.id, problem.title)}
                            title="문제 삭제"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
