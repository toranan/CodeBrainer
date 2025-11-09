"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminProblems() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">문제 관리</h1>
        <Button className="bg-orange-600 hover:bg-orange-700">+ 새 문제 등록</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 문제 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">제목</th>
                  <th className="pb-3 font-semibold">난이도</th>
                  <th className="pb-3 font-semibold">제출 수</th>
                  <th className="pb-3 font-semibold">정답률</th>
                  <th className="pb-3 font-semibold">상태</th>
                  <th className="pb-3 font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4">{i}</td>
                    <td className="py-4 font-medium">문제 제목 {i}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        Gold {i}
                      </span>
                    </td>
                    <td className="py-4">{100 + i * 10}</td>
                    <td className="py-4">{70 - i * 2}%</td>
                    <td className="py-4">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        공개
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">수정</Button>
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

