import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DifficultySelectPage() {
  const difficulties = [
    {
      name: "브론즈",
      path: "/problems/difficulty/bronze",
      description: "기초적인 알고리즘 문제입니다. 프로그래밍 입문자에게 적합합니다.",
      color: "from-amber-100 to-amber-200",
      textColor: "text-amber-800",
      borderColor: "border-amber-300",
      icon: "/tiers/Bronze.png",
    },
    {
      name: "실버",
      path: "/problems/difficulty/silver",
      description: "중급 수준의 알고리즘 문제입니다. 기본적인 자료구조와 알고리즘 지식이 필요합니다.",
      color: "from-slate-200 to-slate-300",
      textColor: "text-slate-700",
      borderColor: "border-slate-400",
      icon: "/tiers/Silver.png",
    },
    {
      name: "골드",
      path: "/problems/difficulty/gold",
      description: "고급 수준의 알고리즘 문제입니다. 다양한 알고리즘 기법과 최적화가 필요합니다.",
      color: "from-yellow-100 to-yellow-200",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-400",
      icon: "/tiers/Gold.png",
    },
    {
      name: "플래티넘",
      path: "/problems/difficulty/platinum",
      description: "최고 난이도의 알고리즘 문제입니다. 심화된 알고리즘 지식과 창의적인 접근이 필요합니다.",
      color: "from-emerald-100 to-emerald-200",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-400",
      icon: "/tiers/Platinum.png",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <Link href="/problems" className="text-sm text-primary hover:underline">
          ← 문제 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-semibold text-slate-900">난이도별 문제</h1>
        <p className="text-sm text-slate-600">
          원하는 난이도를 선택하여 문제를 풀어보세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {difficulties.map((difficulty) => (
          <Link key={difficulty.path} href={difficulty.path}>
            <Card className={`border-2 ${difficulty.borderColor} transition hover:shadow-xl hover:scale-105 cursor-pointer h-full`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img src={difficulty.icon} alt={difficulty.name} className="w-16 h-16 object-contain" />
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {difficulty.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardDescription className="text-sm text-slate-600">
                  {difficulty.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
