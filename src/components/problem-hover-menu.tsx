"use client"

import Link from "next/link"
import { useState, useRef } from "react"

export function ProblemHoverMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="hover:text-primary cursor-pointer text-sm font-medium text-muted-foreground">
        문제 목록
      </span>

      {isOpen && (
        <div
          className="absolute left-0 top-full w-48 z-[9999]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* 투명한 연결 영역 */}
          <div className="h-2 w-full bg-transparent"></div>
          {/* 실제 드롭다운 메뉴 */}
          <div className="rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="py-1">
              <Link
                href="/problems"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                전체 문제
              </Link>
              <Link
                href="/problems/difficulty"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                난이도별 문제
              </Link>
              <Link
                href="/problems/algorithm"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                알고리즘별 문제
              </Link>
              <Link
                href="/problems/mock-exam"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                실전 모의고사
              </Link>
              <Link
                href="/problems/company"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                기업별 기출 문제
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
