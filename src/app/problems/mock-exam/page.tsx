"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function MockExamPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-20">
      <header className="space-y-4">
        <Link href="/problems" className="text-sm text-primary hover:underline">
          ← 문제 목록으로 돌아가기
        </Link>
      </header>

      <Card className="border-2">
        <CardHeader className="text-center space-y-4 pb-8 pt-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Construction className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-3xl">기업별 모의고사</CardTitle>
          <p className="text-lg text-slate-600">
            아직 준비중입니다
          </p>
        </CardHeader>
        <CardContent className="text-center pb-12">
          <p className="text-slate-500">
            곧 다양한 기업의 실전 코딩 테스트를 체험할 수 있도록 준비하고 있습니다.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            조금만 기다려주세요! 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
