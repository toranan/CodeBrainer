import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problemId");

    if (!problemId) {
      return NextResponse.json(
        { error: "문제 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const hints = await prisma.problemHint.findMany({
      where: {
        problemId: parseInt(problemId),
      },
      orderBy: {
        stage: 'asc',
      },
    });

    return NextResponse.json(hints);
  } catch (error) {
    console.error("힌트 조회 실패:", error);
    return NextResponse.json(
      { error: "힌트를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const hint = await prisma.problemHint.create({
      data: {
        problemId: body.problemId,
        tier: body.tier,
        stage: body.stage,
        title: body.title,
        content: body.content,
        waitSeconds: body.waitSeconds,
      },
    });

    return NextResponse.json(hint);
  } catch (error) {
    console.error("힌트 생성 실패:", error);
    return NextResponse.json(
      { error: "힌트 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    const hint = await prisma.problemHint.update({
      where: { id: body.id },
      data: {
        tier: body.tier,
        stage: body.stage,
        title: body.title,
        content: body.content,
        waitSeconds: body.waitSeconds,
      },
    });

    return NextResponse.json(hint);
  } catch (error) {
    console.error("힌트 수정 실패:", error);
    return NextResponse.json(
      { error: "힌트 수정에 실패했습니다" },
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
        { error: "힌트 ID가 필요합니다" },
        { status: 400 }
      );
    }

    await prisma.problemHint.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("힌트 삭제 실패:", error);
    return NextResponse.json(
      { error: "힌트 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}

