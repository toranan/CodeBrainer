import { NextResponse } from "next/server";

import { fetchAdminDashboardStats } from "@/server/admin-service";

export async function GET() {
  try {
    const stats = await fetchAdminDashboardStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[API][Admin][Dashboard] 실패", error);
    return NextResponse.json(
      { message: "대시보드 데이터를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}

