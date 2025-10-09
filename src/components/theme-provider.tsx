"use client"

import { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface Props {
  children: ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
}

export function ThemeProvider({ children, ...props }: Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
