import type { SupportedLanguage } from "@/types/problem";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "PYTHON",
  "JAVA",
  "CPP",
  "C",
  "JAVASCRIPT",
  "GO",
];

export const LANGUAGE_LABEL: Record<SupportedLanguage, string> = {
  PYTHON: "Python",
  JAVA: "Java",
  CPP: "C++",
  C: "C",
  JAVASCRIPT: "JavaScript",
  GO: "Go",
};

export const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  PYTHON: "python",
  JAVA: "java",
  CPP: "cpp",
  C: "c",
  JAVASCRIPT: "javascript",
  GO: "go",
};

export const LANGUAGE_ORDER: SupportedLanguage[] = [
  "PYTHON",
  "JAVA",
  "CPP",
  "C",
  "JAVASCRIPT",
  "GO",
];

