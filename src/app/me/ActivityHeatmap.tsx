"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityHeatmap({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 30일 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {data.map((d: any, idx: number) => {
            const intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 5 ? 2 : 3;
            const colors = [
              "bg-slate-100",
              "bg-green-200",
              "bg-green-400",
              "bg-green-600"
            ];
            return (
              <div
                key={idx}
                className={`h-8 rounded ${colors[intensity]} flex items-center justify-center text-xs`}
                title={`${d.date}: ${d.count}개`}
              >
                {d.count > 0 ? d.count : ""}
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            활동 데이터가 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
}

