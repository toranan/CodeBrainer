"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompanySelectPage() {
  const companies = [
    {
      name: "삼성",
      path: "/problems/company/samsung",
      description: "삼성전자 SW역량테스트 기출문제입니다.",
      logo: "🏢",
      borderColor: "border-blue-400",
      bgColor: "bg-blue-50",
    },
    {
      name: "카카오",
      path: "/problems/company/kakao",
      description: "카카오 코딩테스트 기출문제입니다.",
      logo: "💬",
      borderColor: "border-yellow-400",
      bgColor: "bg-yellow-50",
    },
    {
      name: "토스",
      path: "/problems/company/toss",
      description: "토스 NEXT 개발자 채용 코딩테스트 기출문제입니다.",
      logo: "💳",
      borderColor: "border-indigo-400",
      bgColor: "bg-indigo-50",
    },
  ]

  const handleCompanyClick = (companyName: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    toast(`${companyName} 기출문제는 준비중입니다.`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">기업별 기출 문제</h1>
        <p className="text-sm text-slate-600">
          원하는 기업의 코딩테스트 기출문제를 풀어보세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Link key={company.path} href={company.path} onClick={handleCompanyClick(company.name)}>
            <Card className={`border-2 ${company.borderColor} ${company.bgColor} transition hover:shadow-xl hover:scale-105 cursor-pointer h-full`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{company.logo}</span>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {company.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <CardDescription className="text-sm text-slate-600">
                  {company.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
