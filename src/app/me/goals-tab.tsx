"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function GoalsTab() {
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [monthlyGoal, setMonthlyGoal] = useState(20);
  const [dailyHours, setDailyHours] = useState(1);

  // 임시 진행 상태 (나중에 API로 가져올 데이터)
  const weeklyProgress = 3; // 이번 주 푼 문제 수
  const monthlyProgress = 12; // 이번 달 푼 문제 수

  const handleSaveGoals = () => {
    // TODO: API 연동
    toast.success("학습 목표가 저장되었습니다");
  };

  return (
    <div className="space-y-6">
      {/* 현재 목표 */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 현재 학습 목표</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 주간 목표 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">주간 목표: {weeklyGoal}문제</h3>
              <span className="text-sm text-slate-600">
                {weeklyProgress} / {weeklyGoal} 완료
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {weeklyGoal - weeklyProgress > 0
                ? `${weeklyGoal - weeklyProgress}문제 남았어요! 조금만 더 힘내세요 💪`
                : "목표 달성! 🎉"}
            </p>
          </div>

          {/* 월간 목표 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">월간 목표: {monthlyGoal}문제</h3>
              <span className="text-sm text-slate-600">
                {monthlyProgress} / {monthlyGoal} 완료
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(monthlyProgress / monthlyGoal) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              이번 달 {Math.round((monthlyProgress / monthlyGoal) * 100)}% 달성!
            </p>
          </div>

          {/* 일일 학습 시간 목표 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">일일 학습 시간: {dailyHours}시간</h3>
              <span className="text-sm text-slate-600">오늘 0.5시간</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: "50%" }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">조금만 더 하면 목표 달성!</p>
          </div>
        </CardContent>
      </Card>

      {/* 목표 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ 목표 설정하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weeklyGoal">주간 문제 풀이 목표 (개)</Label>
            <Input
              id="weeklyGoal"
              type="number"
              min="1"
              max="50"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-slate-500">일주일에 풀고 싶은 문제 수</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyGoal">월간 문제 풀이 목표 (개)</Label>
            <Input
              id="monthlyGoal"
              type="number"
              min="1"
              max="200"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-slate-500">한 달에 풀고 싶은 문제 수</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyHours">일일 학습 시간 목표 (시간)</Label>
            <Input
              id="dailyHours"
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-slate-500">하루에 학습하고 싶은 시간</p>
          </div>

          <Button onClick={handleSaveGoals} className="w-full">
            목표 저장
          </Button>
        </CardContent>
      </Card>

      {/* 추천 목표 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 추천 목표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <h4 className="font-medium">🏃 초보자 코스</h4>
              <p className="text-sm text-slate-600">주 3문제 / 월 12문제</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setWeeklyGoal(3);
                  setMonthlyGoal(12);
                }}
              >
                적용하기
              </Button>
            </div>

            <div className="rounded-lg border p-3">
              <h4 className="font-medium">🚴 중급자 코스</h4>
              <p className="text-sm text-slate-600">주 5문제 / 월 20문제</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setWeeklyGoal(5);
                  setMonthlyGoal(20);
                }}
              >
                적용하기
              </Button>
            </div>

            <div className="rounded-lg border p-3">
              <h4 className="font-medium">🚀 고급자 코스</h4>
              <p className="text-sm text-slate-600">주 10문제 / 월 40문제</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setWeeklyGoal(10);
                  setMonthlyGoal(40);
                }}
              >
                적용하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

