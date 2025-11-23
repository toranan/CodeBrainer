"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users as UsersIcon, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface User {
  user_id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserStats {
  userId: number;
  username: string;
  solvedProblems: number;
  attemptedProblems: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<Record<number, UserStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 사용자 목록 조회
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // 각 사용자의 제출 통계 조회
      const statsPromises = (usersData || []).map(async (user) => {
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select('status')
          .eq('user_id', user.user_id);

        if (error) {
          console.error(`User ${user.user_id} stats error:`, error);
          return {
            userId: user.user_id,
            username: user.username,
            solvedProblems: 0,
            attemptedProblems: 0,
          };
        }

        const total = submissions?.length || 0;
        const solved = submissions?.filter(s => s.status === 'AC').length || 0;

        return {
          userId: user.user_id,
          username: user.username,
          solvedProblems: solved,
          attemptedProblems: total,
        };
      });

      const stats = await Promise.all(statsPromises);
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.userId] = stat;
        return acc;
      }, {} as Record<number, UserStats>);

      setUserStats(statsMap);
      toast.success(`${usersData?.length || 0}명의 사용자 정보를 불러왔습니다`);
    } catch (error) {
      console.error("데이터 조회 실패:", error);
      toast.error("데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSolved = Object.values(userStats).reduce(
    (sum, stat) => sum + stat.solvedProblems,
    0
  );
  const totalAttempted = Object.values(userStats).reduce(
    (sum, stat) => sum + stat.attemptedProblems,
    0
  );
  const avgAcRate =
    totalAttempted > 0 ? (totalSolved / totalAttempted) * 100 : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">사용자 통계</h1>
          <p className="text-slate-600">
            전체 사용자 및 활동 통계를 확인합니다 (Supabase 직접 연동)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            새로고침
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">← 관리자 콘솔</Link>
          </Button>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">전체 사용자</p>
                <p className="text-2xl font-bold">{users.length}명</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">전체 정답 수</p>
                <p className="text-2xl font-bold">{totalSolved}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-50 p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">전체 정답률</p>
                <p className="text-2xl font-bold">{avgAcRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="사용자명, 이름, 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">아이디</th>
                  <th className="pb-3 font-semibold">이름</th>
                  <th className="pb-3 font-semibold">이메일</th>
                  <th className="pb-3 font-semibold">정답 문제</th>
                  <th className="pb-3 font-semibold">시도 문제</th>
                  <th className="pb-3 font-semibold">정답률</th>
                  <th className="pb-3 font-semibold">권한</th>
                  <th className="pb-3 font-semibold">가입일</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const stats = userStats[user.user_id];
                    const acRate = stats?.attemptedProblems > 0
                      ? (stats.solvedProblems / stats.attemptedProblems) * 100
                      : 0;

                    return (
                      <tr key={user.user_id} className="border-b hover:bg-slate-50">
                        <td className="py-4">
                          <div className="font-medium">{user.username}</div>
                        </td>
                        <td className="py-4">{user.name}</td>
                        <td className="py-4 text-sm text-slate-600">
                          {user.email}
                        </td>
                        <td className="py-4">
                          <Badge className="bg-green-100 text-green-800">
                            {stats?.solvedProblems || 0}개
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline">
                            {stats?.attemptedProblems || 0}개
                          </Badge>
                        </td>
                        <td className="py-4">
                          <span className="font-medium">
                            {acRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge
                            className={
                              user.role === "ADMIN"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          {new Date(user.created_at).toLocaleDateString()}
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
