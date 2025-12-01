import Link from "next/link";

import { cn } from "@/lib/utils";

const features = [
  {
    title: "실전 문제풀이",
    description:
      "프로그래머스 스타일의 문제 UI에서 언어별 템플릿과 힌트를 활용해 실력을 키워보세요.",
  },
  {
    title: "AI 코드 리뷰",
    description: "정답을 맞추면 모범답안과 비교한 맞춤형 피드백과 다른 접근법을 제공합니다.",
  },
  {
    title: "모의고사 모드",
    description: "타이머와 제출 제한을 적용한 실전 모드로 취업 코딩 테스트를 대비하세요.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              ThinkCoding / CodeBrainer
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              알고리즘 학습과 실전 대비를 한 곳에서
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              CodeBrainer는 문제 풀이, 모의고사, 힌트 시스템, AI 코드 리뷰까지 제공하는
              차세대 코딩 테스트 플랫폼입니다. 빠르게 실력을 끌어올리고 실전 감각을 유지하세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/problems"
                className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                문제 풀러가기
              </Link>
              <Link
                href="/problems/mock-exam"
                className="inline-flex items-center rounded-md border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:text-primary"
              >
                모의고사 시작
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200" />
            <div className="relative flex flex-col gap-6 p-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">플랫폼 미리보기</p>
                <p className="text-lg font-semibold text-slate-900">
                  문제 설명 / 에디터 / 채점 결과를 한 화면에서
                </p>
              </div>
              <div className="grid gap-4 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">힌트 시스템</p>
                  <p className="mt-1 text-sm">
                    대기시간 후 단계별 힌트를 열어 사고 과정을 학습할 수 있습니다.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">AI 리뷰</p>
                  <p className="mt-1 text-sm">
                    모범답안과 비교한 개선 포인트와 다른 접근법을 자동으로 제안합니다.
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primary">
                6개 언어 지원 · Docker 샌드박스 채점 · Postgres 기반 데이터 관리
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition",
                "hover:-translate-y-1 hover:shadow-xl"
              )}
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/30 bg-gradient-to-r from-slate-100 via-white to-slate-100 px-8 py-10 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                지금 바로 CodeBrainer와 함께 시작하세요
              </h2>
              <p className="text-sm text-slate-600">
                Google / Microsoft / 이메일 로그인을 지원합니다. 맞춤형 학습 통계와 기록을 저장하세요.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                로그인
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-md border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:text-primary"
              >
                플랫폼 소개
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
