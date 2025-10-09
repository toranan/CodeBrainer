import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProblemWorkspace } from "@/components/problem/problem-workspace"
import { fetchProblemDetailBySlug } from "@/server/problem-service"

interface ProblemPageProps {
  params: Promise<{ slug: string }>
}

async function getParams(paramsPromise: ProblemPageProps["params"]) {
  return paramsPromise instanceof Promise ? paramsPromise : Promise.resolve(paramsPromise)
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  const { slug } = await getParams(params)
  const problem = await fetchProblemDetailBySlug(slug)

  if (!problem) {
    return {
      title: "문제를 찾을 수 없습니다",
    }
  }

  return {
    title: `${problem.title} 문제`,
    description: `${problem.title} 문제 상세 페이지`,
  }
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await getParams(params)
  const problem = await fetchProblemDetailBySlug(slug)

  if (!problem) {
    notFound()
  }

  return <ProblemWorkspace problem={problem} />
}
