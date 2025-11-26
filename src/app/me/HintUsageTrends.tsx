"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getGrowthTrend } from "@/server/mypage-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HintUsageTrendsProps {
  data: any;
  days: 7 | 30 | 90 | 365;
  onChangeDays: (days: 7 | 30 | 90 | 365) => void;
  userId: string;
}

function TrendBadge({ recent, previous }: { recent: number; previous: number }) {
  const diff = recent - previous;
  const hasChange = previous > 0 || recent > 0;

  if (!hasChange) {
    return <span className="text-xs text-muted-foreground">변화 없음</span>;
  }

  const sign = diff > 0 ? "+" : "";
  const color = diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-600" : "text-muted-foreground";
  const label = diff > 0 ? "증가" : diff < 0 ? "감소" : "변화 없음";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {label} ({sign}
      {diff})
    </span>
  );
}

export default function HintUsageTrends({ data, days, onChangeDays, userId }: HintUsageTrendsProps) {
  const categoryTrends = data?.categoryTrends ?? [];
  const tierTrends = data?.tierTrends ?? [];
  const levelTrends = data?.levelTrends ?? [];

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const hasFilter =
    selectedCategory !== "ALL" || selectedTier !== "ALL" || selectedLevel !== "ALL";

  const {
    data: growth,
    isLoading: growthLoading,
  } = useQuery({
    queryKey: [
      "me/hint-growth",
      userId,
      days,
      selectedCategory,
      selectedTier,
      selectedLevel,
    ],
    queryFn: () =>
      getGrowthTrend({
        userId,
        days,
        category: selectedCategory === "ALL" ? undefined : selectedCategory,
        tier: selectedTier === "ALL" ? undefined : selectedTier,
        level: selectedLevel === "ALL" ? undefined : Number(selectedLevel),
      }),
    enabled: !!userId && hasFilter,
  });

  const points = growth?.points ?? [];

  const maxValue = useMemo(() => {
    if (!points || points.length === 0) return 0;
    return Math.max(...points.map((p: any) => p.count ?? 0));
  }, [points]);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">힌트 사용량 변화</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { label: "7일", value: 7 as const },
              { label: "30일", value: 30 as const },
              { label: "3개월", value: 90 as const },
              { label: "1년", value: 365 as const },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeDays(option.value)}
                className={`rounded-full px-3 py-1 border text-xs transition ${
                  days === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">카테고리</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {categoryTrends.map((c: any) => (
                  <SelectItem key={c.category} value={c.category}>
                    {c.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">티어</span>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="티어 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {tierTrends.map((t: any) => (
                  <SelectItem key={t.tier} value={t.tier}>
                    {t.tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">난이도 (Level)</span>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="난이도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {levelTrends.map((l: any) => (
                  <SelectItem key={l.level} value={String(l.level)}>
                    Level {l.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          최근{" "}
          {days === 7
            ? "7일"
            : days === 30
            ? "30일"
            : days === 90
            ? "3개월"
            : "1년"}
          간 해결한 문제 기준으로, 선택한 카테고리 · 티어 · 난이도에 해당하는 힌트 사용량만 그래프로 보여줘요.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasFilter && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            위에서 카테고리 · 티어 · 난이도 중 하나 이상을 선택하면, 해당 조건에 맞는 힌트 사용량 추이를
            보여드릴게요.
          </div>
        )}

        {hasFilter && growthLoading && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            힌트 사용량 추이를 불러오는 중입니다...
          </div>
        )}

        {hasFilter && !growthLoading && points.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            선택한 조건에 해당하는 힌트 사용 기록이 없습니다.
          </div>
        )}

        {hasFilter && !growthLoading && points.length > 0 && (
          <>
            {/* 기간별 힌트 사용량 추이 (막대 그래프) */}
            <div className="h-64 w-full overflow-x-auto">
              <div className="flex h-full items-end gap-2 min-w-full">
                {points.map((p: any) => {
                  const count = p.count ?? 0;
                  const safeMax = maxValue || 1;
                  const height = (count / safeMax) * 100;

                  return (
                    <div key={p.date} className="flex flex-col items-center gap-1 text-[11px]">
                      <div className="flex h-40 w-6 items-end">
                        <div
                          className="w-full rounded-t bg-emerald-500"
                          style={{ height: `${height}%` }}
                          title={`${p.date}: ${count}회`}
                        />
                      </div>
                      <span className="truncate max-w-[52px]" title={p.date}>
                        {p.date.slice(5)}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                총 힌트 사용량: <span className="font-semibold text-slate-700">{growth?.totalHints ?? 0}</span>회
              </span>
              <span>막대 하나 = 해당 날짜에 사용한 힌트 수</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

