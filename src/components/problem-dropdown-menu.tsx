"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProblemDropdownMenu() {
  const router = useRouter()

  const handleValueChange = (value: string) => {
    router.push(value)
  }

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="문제 카테고리 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="/problems/difficulty">난이도별 문제</SelectItem>
        <SelectItem value="/problems/algorithm">알고리즘별 문제</SelectItem>
        <SelectItem value="/problems/mock-exam">실전 모의고사</SelectItem>
      </SelectContent>
    </Select>
  )
}
