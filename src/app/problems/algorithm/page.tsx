import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AlgorithmSelectPage() {
  const algorithms = [
    {
      name: "해시",
      category: "해시",
      description: "데이터를 키를 이용해 빠르게 접근할 수 있는 자료 구조입니다.",
      frequency: "높음 ↗",
      score: "보통 ➜",
      borderColor: "border-blue-300",
    },
    {
      name: "스택/큐",
      category: "스택/큐",
      description: "데이터를 넣고 빼는 순서를 규칙적으로 관리하는 구조로, LIFO·FIFO의 대표적인 예입니다.",
      frequency: "보통 ➜",
      score: "높음 ↗",
      borderColor: "border-green-300",
    },
    {
      name: "힙(Heap)",
      category: "힙",
      description: "우선순위를 기준으로 데이터를 효율적으로 관리할 수 있는 트리 기반 구조입니다.",
      frequency: "보통 ➜",
      score: "높음 ↗",
      borderColor: "border-purple-300",
    },
    {
      name: "정렬",
      category: "정렬",
      description: "데이터를 특정 기준에 맞춰 정리해 다양한 문제를 해결하는 기반이 되는 알고리즘입니다.",
      frequency: "높음 ↗",
      score: "높음 ↗",
      borderColor: "border-indigo-300",
    },
    {
      name: "완전탐색",
      category: "완전탐색",
      description: "가능한 모든 조합을 확인하며 정답을 직접 찾아가는 방식입니다.",
      frequency: "높음 ↗",
      score: "낮음 ↘",
      borderColor: "border-red-300",
    },
    {
      name: "탐욕법(Greedy)",
      category: "탐욕법",
      description: "각 단계에서 최선이라고 판단되는 선택을 이어가며 해답을 만드는 알고리즘입니다.",
      frequency: "낮음 ↘",
      score: "낮음 ↘",
      borderColor: "border-orange-300",
    },
    {
      name: "동적계획법(Dynamic Programming)",
      category: "동적계획법",
      description: "부분 문제를 저장·재사용해 연산량을 줄이며 최적해를 찾는 방식입니다.",
      frequency: "낮음 ↘",
      score: "낮음 ↘",
      borderColor: "border-pink-300",
    },
    {
      name: "깊이/너비 우선 탐색(DFS/BFS)",
      category: "DFS/BFS",
      description: "그래프나 트리를 체계적으로 탐색해 원하는 정보를 찾는 기본적인 탐색 기법입니다.",
      frequency: "높음 ↗",
      score: "낮음 ↘",
      borderColor: "border-teal-300",
    },
    {
      name: "이분탐색",
      category: "이분탐색",
      description: "정렬된 자료에서 탐색 범위를 절반씩 좁혀 빠르게 값을 찾아내는 알고리즘입니다.",
      frequency: "낮음 ↘",
      score: "낮음 ↘",
      borderColor: "border-cyan-300",
    },
    {
      name: "그래프",
      category: "그래프",
      description: "노드와 연결 관계를 기반으로 다양한 구조를 표현하고 탐색하는 알고리즘 분야입니다.",
      frequency: "낮음 ↘",
      score: "낮음 ↘",
      borderColor: "border-slate-300",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">알고리즘별 문제</h1>
        <p className="text-sm text-slate-600">
          원하는 알고리즘 유형을 선택하여 문제를 풀어보세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {algorithms.map((algorithm) => (
          <Link key={algorithm.category} href={`/problems#${encodeURIComponent(algorithm.category)}`}>
            <Card className={`border-2 ${algorithm.borderColor} transition hover:shadow-xl hover:scale-105 cursor-pointer h-full`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {algorithm.name}
                </CardTitle>
                <div className="flex gap-4 text-xs text-slate-500 mt-2">
                  <span>출제 빈도: {algorithm.frequency}</span>
                  <span>평균 점수: {algorithm.score}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <CardDescription className="text-sm text-slate-600">
                  {algorithm.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
