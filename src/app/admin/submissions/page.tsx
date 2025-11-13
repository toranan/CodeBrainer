"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubmissions() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">제출 내역</h1>

      <Card>
        <CardHeader>
          <CardTitle>전체 제출 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">사용자</th>
                  <th className="pb-3 font-semibold">문제</th>
                  <th className="pb-3 font-semibold">언어</th>
                  <th className="pb-3 font-semibold">결과</th>
                  <th className="pb-3 font-semibold">실행시간</th>
                  <th className="pb-3 font-semibold">메모리</th>
                  <th className="pb-3 font-semibold">제출시간</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, user: "user1", problem: "두 수의 합", lang: "Python", result: "정답", time: "120ms", memory: "12MB" },
                  { id: 2, user: "user2", problem: "피보나치", lang: "Java", result: "시간초과", time: "1200ms", memory: "24MB" },
                  { id: 3, user: "user3", problem: "이진 탐색", lang: "C++", result: "정답", time: "80ms", memory: "8MB" },
                  { id: 4, user: "user1", problem: "DFS", lang: "JavaScript", result: "런타임 에러", time: "-", memory: "-" },
                  { id: 5, user: "user4", problem: "다익스트라", lang: "Python", result: "정답", time: "450ms", memory: "32MB" },
                ].map((submission) => (
                  <tr key={submission.id} className="border-b">
                    <td className="py-4">{submission.id}</td>
                    <td className="py-4 font-medium">{submission.user}</td>
                    <td className="py-4">{submission.problem}</td>
                    <td className="py-4">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">
                        {submission.lang}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          submission.result === "정답"
                            ? "bg-green-100 text-green-800"
                            : submission.result === "시간초과"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.result}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{submission.time}</td>
                    <td className="py-4 text-sm text-slate-600">{submission.memory}</td>
                    <td className="py-4 text-sm text-slate-600">방금 전</td>
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

