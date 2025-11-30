import { NextResponse } from "next/server";

import { deleteAdminProblem } from "@/server/admin-service";

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const problemId = Number(params.id);
    if (Number.isNaN(problemId)) {
      return NextResponse.json({ message: "잘못된 문제 ID입니다." }, { status: 400 });
    }

    await deleteAdminProblem(problemId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API][Admin][Problems][Delete] 실패", error);
    return NextResponse.json({ message: "문제를 삭제하지 못했습니다." }, { status: 502 });
  }
}

