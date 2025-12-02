import type { SupportedLanguage } from "@/types/problem";

interface LanguagePattern {
  keywords: string[];
  syntax: RegExp[];
}

const LANGUAGE_PATTERNS: Record<SupportedLanguage, LanguagePattern> = {
  PYTHON: {
    keywords: ["def ", "import ", "from ", "class ", "if ", "elif ", "else:", "for ", "while ", "return "],
    syntax: [/def\s+\w+\s*\(/, /import\s+\w+/, /:\s*$/m, /^[\s]*#/m],
  },
  JAVASCRIPT: {
    keywords: ["function ", "const ", "let ", "var ", "=>", "console.log", "class ", "if ", "else ", "return "],
    syntax: [/function\s+\w+\s*\(/, /const\s+\w+/, /let\s+\w+/, /=>\s*{?/, /console\.\w+/],
  },
  JAVA: {
    keywords: ["public ", "private ", "class ", "static ", "void ", "int ", "String ", "System.out"],
    syntax: [/public\s+class/, /public\s+static/, /System\.out/, /\w+\s+\w+\s*\(/],
  },
  CPP: {
    keywords: ["#include", "using namespace", "int main", "std::", "cout", "cin", "class ", "template"],
    syntax: [/#include\s*</, /using namespace/, /int\s+main\s*\(/, /std::/],
  },
  C: {
    keywords: ["#include", "int main", "printf", "scanf", "void ", "struct "],
    syntax: [/#include\s*</, /int\s+main\s*\(/, /printf\s*\(/, /scanf\s*\(/],
  },
  GO: {
    keywords: ["package ", "func ", "import ", "var ", "type ", "fmt."],
    syntax: [/package\s+\w+/, /func\s+\w+\s*\(/, /import\s+/, /fmt\.\w+/],
  },
};

/**
 * 코드에서 실제 사용된 언어를 간단히 감지합니다.
 * 완벽한 감지는 아니지만, 명백히 다른 언어를 거를 수 있습니다.
 */
export function detectLanguage(code: string): SupportedLanguage | null {
  if (!code || code.trim().length === 0) {
    return null;
  }

  const scores: Partial<Record<SupportedLanguage, number>> = {};

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;

    // 키워드 체크
    for (const keyword of pattern.keywords) {
      if (code.includes(keyword)) {
        score += 1;
      }
    }

    // 정규식 패턴 체크
    for (const regex of pattern.syntax) {
      if (regex.test(code)) {
        score += 2; // 정규식 매치는 더 높은 점수
      }
    }

    if (score > 0) {
      scores[lang as SupportedLanguage] = score;
    }
  }

  // 가장 높은 점수를 받은 언어 반환
  const entries = Object.entries(scores) as [SupportedLanguage, number][];
  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * 선택한 언어와 코드가 일치하는지 검증합니다.
 */
export function validateLanguage(code: string, selectedLanguage: SupportedLanguage): {
  isValid: boolean;
  detectedLanguage: SupportedLanguage | null;
  message?: string;
} {
  const trimmedCode = code.trim();

  // 빈 코드나 기본 템플릿은 통과
  if (
    !trimmedCode ||
    trimmedCode === "// TODO: 여기에 코드를 작성하세요." ||
    trimmedCode.startsWith("// TODO:")
  ) {
    return {
      isValid: false,
      detectedLanguage: null,
      message: "코드를 작성해주세요.",
    };
  }

  const detectedLanguage = detectLanguage(code);

  // 언어가 감지되지 않으면 경고 (너무 짧거나 주석만 있는 경우)
  if (!detectedLanguage) {
    return {
      isValid: true, // 일단 통과시키되 경고
      detectedLanguage: null,
      message: "언어를 감지할 수 없습니다. 코드가 충분히 작성되었는지 확인하세요.",
    };
  }

  // 선택한 언어와 감지된 언어가 다르면 차단
  if (detectedLanguage !== selectedLanguage) {
    return {
      isValid: false,
      detectedLanguage,
      message: `선택한 언어는 ${selectedLanguage}이지만, 작성된 코드는 ${detectedLanguage}로 감지됩니다.`,
    };
  }

  return {
    isValid: true,
    detectedLanguage,
  };
}
