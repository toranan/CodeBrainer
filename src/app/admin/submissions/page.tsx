"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Submission {
  id: number;
  user_id: number;
  problem_id: number;
  language_id: string;
  status: string;
  passed_tests: number;
  total_tests: number;
  avg_time_ms: number;
  avg_mem_kb: number;
  created_at: string;
  problem_title?: string;
  problem_slug?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  AC: {
    label: "정답",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  WA: {
    label: "오답",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  TLE: {
    label: "시간초과",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  MLE: {
    label: "메모리초과",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
  RE: {
    label: "런타임에러",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  CE: {
    label: "컴파일에러",
    color: "bg-slate-100 text-slate-800",
    icon: XCircle,
  },
  QUEUED: {
    label: "대기중",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  RUNNING: {
    label: "실행중",
    color: "bg-indigo-100 text-indigo-800",
    icon: Clock,
  },
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('submissions')
        .select(`
          *,
          problems (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== "ALL") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 문제 정보 포함
      const processedData = (data || []).map(sub => ({
        ...sub,
        problem_title: sub.problems?.title || `문제 #${sub.problem_id}`,
        problem_slug: sub.problems?.slug || `problem-${sub.problem_id}`,
      }));

      setSubmissions(processedData);
      toast.success(`${processedData.length}개의 제출 내역을 불러왔습니다`);
    } catch (error) {
      console.error("제출 내역 조회 실패:", error);
      toast.error("제출 내역을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) =>
    sub.problem_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.problem_slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.user_id.toString().includes(searchQuery)
  );

  const totalSubmissions = submissions.length;
  const acCount = submissions.filter((s) => s.status === "AC").length;
  const acRate = totalSubmissions > 0 ? (acCount / totalSubmissions) * 100 : 0;

  if (loading && submissions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">제출 내역을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">제출 현황</h1>
          <p className="text-slate-600">전체 제출 및 정답률 통계 (Supabase 직접 연동)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSubmissions}>
            새로고침
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">← 관리자 콘솔</Link>
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">전체 제출</p>
                <p className="text-2xl font-bold">{totalSubmissions}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">정답</p>
                <p className="text-2xl font-bold">{acCount}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-50 p-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">정답률</p>
                <p className="text-2xl font-bold">{acRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="문제명, 사용자 ID로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="AC">정답</SelectItem>
                <SelectItem value="WA">오답</SelectItem>
                <SelectItem value="TLE">시간초과</SelectItem>
                <SelectItem value="MLE">메모리초과</SelectItem>
                <SelectItem value="RE">런타임에러</SelectItem>
                <SelectItem value="QUEUED">대기중</SelectItem>
                <SelectItem value="RUNNING">실행중</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 제출 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>제출 내역 ({filteredSubmissions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">제출 ID</th>
                  <th className="pb-3 font-semibold">사용자 ID</th>
                  <th className="pb-3 font-semibold">문제</th>
                  <th className="pb-3 font-semibold">언어</th>
                  <th className="pb-3 font-semibold">결과</th>
                  <th className="pb-3 font-semibold">통과율</th>
                  <th className="pb-3 font-semibold">실행시간</th>
                  <th className="pb-3 font-semibold">메모리</th>
                  <th className="pb-3 font-semibold">제출시간</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      {searchQuery || statusFilter !== "ALL"
                        ? "검색 결과가 없습니다."
                        : "제출 내역이 없습니다."}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => {
                    const statusInfo = STATUS_MAP[submission.status] || STATUS_MAP.WA;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={submission.id} className="border-b hover:bg-slate-50">
                        <td className="py-4">
                          <code className="text-xs">{submission.id}</code>
                        </td>
                        <td className="py-4 font-medium">
                          User #{submission.user_id}
                        </td>
                        <td className="py-4">
                          <Link
                            href={`/problems/${submission.problem_slug}`}
                            className="hover:text-primary hover:underline"
                          >
                            {submission.problem_title}
                          </Link>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline">{submission.language_id}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-slate-600">
                            {submission.passed_tests}/{submission.total_tests}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {submission.avg_time_ms > 0
                            ? `${submission.avg_time_ms}ms`
                            : "-"}
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {submission.avg_mem_kb > 0
                            ? `${(submission.avg_mem_kb / 1024).toFixed(1)}MB`
                            : "-"}
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {new Date(submission.created_at).toLocaleString("ko-KR")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
