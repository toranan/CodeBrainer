import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error("문제 조회 실패:", error);
    return NextResponse.json(
      { error: "문제 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, visibility } = await request.json();

    const updated = await prisma.problem.update({
      where: { id },
      data: { visibility },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("문제 업데이트 실패:", error);
    return NextResponse.json(
      { error: "문제 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "문제 ID가 필요합니다" },
        { status: 400 }
      );
    }

    await prisma.problem.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("문제 삭제 실패:", error);
    return NextResponse.json(
      { error: "문제 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}

