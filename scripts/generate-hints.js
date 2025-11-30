/**
 * 문제 힌트 자동 생성 스크립트
 * Gemini API를 사용하여 문제의 statement를 분석하고 3단계 힌트를 생성합니다.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const pg = require("pg");

// Supabase 연결 설정
const pool = new pg.Pool({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.sqwobsmtrgjuhgymfwtl",
  password: "qpwoe1234",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Gemini API 초기화
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  console.error("다음 명령으로 실행해주세요:");
  console.error("  export GEMINI_API_KEY='your-api-key'");
  console.error("  node scripts/generate-hints.js");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * 문제 statement를 분석하여 3단계 힌트 생성
 */
async function generateHints(problemTitle, statement, difficulty, categories) {
  const prompt = `
당신은 알고리즘 문제 교육 전문가입니다. 다음 문제의 statement를 읽고, 학생들이 문제를 해결하는 데 도움이 되는 3단계 힌트를 생성해주세요.

**문제 제목**: ${problemTitle}
**난이도**: ${difficulty}
**카테고리**: ${categories.join(", ")}

**문제 설명**:
${statement}

---

**힌트 생성 규칙**:
1. **1단계 (tier: "BRONZE", stage: 1)**: 문제를 이해하는 데 도움이 되는 가장 기본적인 힌트. 문제의 핵심을 파악하도록 유도.
2. **2단계 (tier: "SILVER", stage: 2)**: 어떤 자료구조나 알고리즘을 사용해야 하는지 힌트. 접근 방법에 대한 방향 제시.
3. **3단계 (tier: "GOLD", stage: 3)**: 구체적인 구현 방법이나 엣지 케이스에 대한 힌트. 거의 정답에 가까운 수준.

**출력 형식** (JSON):
{
  "hints": [
    {
      "tier": "BRONZE",
      "stage": 1,
      "title": "1단계 힌트 제목 (20자 이내)",
      "content": "1단계 힌트 내용 (마크다운 형식, 200자 이내)"
    },
    {
      "tier": "SILVER",
      "stage": 2,
      "title": "2단계 힌트 제목 (20자 이내)",
      "content": "2단계 힌트 내용 (마크다운 형식, 200자 이내)"
    },
    {
      "tier": "GOLD",
      "stage": 3,
      "title": "3단계 힌트 제목 (20자 이내)",
      "content": "3단계 힌트 내용 (마크다운 형식, 200자 이내)"
    }
  ]
}

**중요**: 힌트는 한국어로 작성하고, JSON 형식만 출력해주세요. 다른 설명은 포함하지 마세요.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // JSON 추출 (코드 블록 제거)
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(text);
    return parsed.hints;
  } catch (error) {
    console.error(`힌트 생성 실패 (${problemTitle}):`, error.message);
    return null;
  }
}

/**
 * 데이터베이스에 힌트 저장
 */
async function saveHints(problemId, hints) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const hint of hints) {
      await client.query(
        `INSERT INTO problem_hints 
         (problem_id, tier, stage, title, content_md, lang, is_active, version, source, wait_seconds, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          problemId,
          hint.tier,
          hint.stage,
          hint.title,
          hint.content,
          "ko",
          true,
          1,
          "gemini_auto",
          hint.stage * 30, // 1단계: 30초, 2단계: 60초, 3단계: 90초
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`✅ 힌트 저장 완료 (문제 ID: ${problemId}, ${hints.length}개)`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ 힌트 저장 실패 (문제 ID: ${problemId}):`, error.message);
  } finally {
    client.release();
  }
}

/**
 * Orchestrator API에서 문제 목록 가져오기
 */
async function fetchProblemsFromOrchestrator() {
  const response = await fetch("http://localhost:8080/api/problems");
  if (!response.ok) {
    throw new Error(`Orchestrator API 호출 실패: ${response.status}`);
  }
  return await response.json();
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("🚀 힌트 생성 스크립트 시작\n");

  try {
    // 1. Orchestrator API에서 문제 목록 가져오기
    console.log("📡 Orchestrator에서 문제 목록 가져오는 중...");
    const problems = await fetchProblemsFromOrchestrator();
    console.log(`📊 총 ${problems.length}개 문제 발견\n`);

    // 2. 각 문제의 힌트 개수 확인
    const result = await pool.query(`
      SELECT problem_id, COUNT(*) as hint_count
      FROM problem_hints
      GROUP BY problem_id
    `);
    
    const hintCounts = new Map(result.rows.map((row) => [row.problem_id, parseInt(row.hint_count)]));

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const problem of problems) {
      const hintCount = hintCounts.get(problem.id) || 0;
      
      console.log(`\n📝 처리 중: [${problem.id}] ${problem.title}`);
      console.log(`   난이도: ${problem.tier}, 레벨: ${problem.level}`);
      console.log(`   카테고리: ${problem.categories?.join(", ") || "없음"}`);
      console.log(`   기존 힌트 개수: ${hintCount}`);

      // statement가 없으면 스킵
      if (!problem.statement || problem.statement.trim() === "") {
        console.log(`   ⏭️  statement가 없어 스킵`);
        skippedCount++;
        continue;
      }

      // 이미 힌트가 3개 이상 있으면 스킵
      if (hintCount >= 3) {
        console.log(`   ⏭️  힌트가 이미 ${hintCount}개 존재하여 스킵`);
        skippedCount++;
        continue;
      }

      // 힌트 생성
      const hints = await generateHints(
        problem.title,
        problem.statement,
        problem.tier,
        problem.categories || []
      );

      if (!hints || hints.length === 0) {
        console.log(`   ❌ 힌트 생성 실패`);
        errorCount++;
        continue;
      }

      console.log(`   💡 생성된 힌트:`);
      hints.forEach((h, i) => {
        console.log(`      ${i + 1}. [${h.tier}/${h.stage}] ${h.title}`);
      });

      // 힌트 저장
      await saveHints(problem.id, hints);
      processedCount++;

      // API 제한을 위한 딜레이 (Gemini API Rate Limit 고려)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("\n\n✨ 힌트 생성 완료!");
    console.log(`   처리됨: ${processedCount}개`);
    console.log(`   스킵: ${skippedCount}개`);
    console.log(`   실패: ${errorCount}개`);
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류:", error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

