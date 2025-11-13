"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminAnnouncements() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">공지사항 관리</h1>
        <Button className="bg-orange-600 hover:bg-orange-700">+ 새 공지사항 작성</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 공지사항 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">제목</th>
                  <th className="pb-3 font-semibold">작성자</th>
                  <th className="pb-3 font-semibold">중요</th>
                  <th className="pb-3 font-semibold">조회수</th>
                  <th className="pb-3 font-semibold">작성일</th>
                  <th className="pb-3 font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, title: "서비스 점검 안내", author: "관리자", important: true, views: 234 },
                  { id: 2, title: "새로운 문제 업데이트", author: "관리자", important: false, views: 156 },
                  { id: 3, title: "이벤트 안내", author: "관리자", important: true, views: 189 },
                  { id: 4, title: "이용약관 변경 안내", author: "관리자", important: false, views: 98 },
                  { id: 5, title: "시스템 개선 사항", author: "관리자", important: false, views: 67 },
                ].map((announcement) => (
                  <tr key={announcement.id} className="border-b">
                    <td className="py-4">{announcement.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {announcement.important && (
                          <span className="text-red-600">📌</span>
                        )}
                        <span className="font-medium">{announcement.title}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{announcement.author}</td>
                    <td className="py-4">
                      {announcement.important ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          중요
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          일반
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-slate-600">{announcement.views}</td>
                    <td className="py-4 text-sm text-slate-600">2025-01-08</td>
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

