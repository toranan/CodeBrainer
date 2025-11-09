"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlgorithmStats({ data }: { data: any }) {
  const categories = data?.solvedCountByCategory ?? [];
  const levels = data?.solvedCountByLevel ?? [];
  const langs = data?.languageUsage ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">카테고리별 해결 수</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 max-h-64 overflow-auto">
          {categories.map((c: any) => (
            <div key={c.category} className="flex items-center justify-between">
              <span className="font-medium">{c.category}</span>
              <span className="text-primary font-semibold">{c.count}</span>
            </div>
          ))}
          {categories.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">난이도별 해결 수</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {levels.map((l: any) => (
            <div key={l.level} className="flex items-center justify-between">
              <span className="font-medium">Level {l.level}</span>
              <span className="text-primary font-semibold">{l.count}</span>
            </div>
          ))}
          {levels.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용 언어</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {langs.map((l: any) => (
            <div key={l.lang} className="flex items-center justify-between">
              <span className="font-medium">{l.lang}</span>
              <span className="text-primary font-semibold">{l.count}</span>
            </div>
          ))}
          {langs.length === 0 && <div>데이터 없음</div>}
        </CardContent>
      </Card>
    </div>
  );
}

