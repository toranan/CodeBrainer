"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">사용자 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle>전체 사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">아이디</th>
                  <th className="pb-3 font-semibold">이름</th>
                  <th className="pb-3 font-semibold">이메일</th>
                  <th className="pb-3 font-semibold">권한</th>
                  <th className="pb-3 font-semibold">가입일</th>
                  <th className="pb-3 font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, username: "admin", name: "관리자", email: "admin@codebrainer.com", role: "ADMIN" },
                  { id: 2, username: "user1", name: "사용자1", email: "user1@example.com", role: "USER" },
                  { id: 3, username: "user2", name: "사용자2", email: "user2@example.com", role: "USER" },
                  { id: 4, username: "user3", name: "사용자3", email: "user3@example.com", role: "USER" },
                  { id: 5, username: "user4", name: "사용자4", email: "user4@example.com", role: "USER" },
                ].map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-4">{user.id}</td>
                    <td className="py-4 font-medium">{user.username}</td>
                    <td className="py-4">{user.name}</td>
                    <td className="py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600">2025-01-01</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">권한 변경</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

