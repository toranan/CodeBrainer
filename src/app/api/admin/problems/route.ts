import { NextRequest, NextResponse } from "next/server";

import { fetchAdminProblems } from "@/server/admin-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "0");
    const size = Number(searchParams.get("size") ?? "20");
    const sort = searchParams.get("sort") ?? undefined;

    const data = await fetchAdminProblems({
      page: Number.isNaN(page) ? 0 : page,
      size: Number.isNaN(size) ? 20 : size,
      sort,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[API][Admin][Problems] 실패", error);
    return NextResponse.json(
      { message: "문제 목록을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}

