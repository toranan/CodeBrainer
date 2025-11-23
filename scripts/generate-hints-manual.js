/**
 * AI 없이 규칙 기반으로 힌트 자동 생성
 * - BRONZE: 1개 힌트
 * - SILVER: 2개 힌트
 * - GOLD: 3개 힌트
 * - PLATINUM: 3개 힌트
 */

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
 * 난이도에 따라 생성할 힌트 개수 결정
 */
function getHintCountByTier(tier) {
  const tierUpper = tier.toUpperCase();
  if (tierUpper === "BRONZE") return 1;
  if (tierUpper === "SILVER") return 2;
  if (tierUpper === "GOLD" || tierUpper === "PLATINUM") return 3;
  return 2; // 기본값
}

/**
 * 문제 statement를 분석하여 맞춤형 힌트 생성
 */
function generateHintsForProblem(problem, hintCount) {
  const { title, tier, categories, statement } = problem;
  const hints = [];
  const category = categories && categories.length > 0 ? categories[0] : "";
  
  // 문제 내용 분석
  const hasMax = statement.includes("최대") || statement.includes("최댓값");
  const hasMin = statement.includes("최소") || statement.includes("최솟값");
  const hasCounting = statement.includes("경우의 수") || statement.includes("가짓수") || statement.includes("개수");
  const hasParen = statement.includes("괄호");
  const hasGraph = statement.includes("그래프") || statement.includes("정점") || statement.includes("간선");
  const hasArray = statement.includes("배열") || statement.includes("수열");
  const hasString = statement.includes("문자열");
  const hasSort = statement.includes("정렬");
  const hasSearch = statement.includes("찾기") || statement.includes("탐색");
  
  // Stage 1: 문제 이해 힌트 (모든 난이도)
  let stage1Content = "";
  
  if (hasParen) {
    stage1Content = `괄호의 짝이 올바르게 맞는지 확인하는 문제입니다. 여는 괄호와 닫는 괄호가 어떤 순서로 나와야 올바른지 생각해보세요.`;
  } else if (hasGraph) {
    stage1Content = `그래프의 정점과 간선 관계를 파악하세요. 어떤 정점들이 연결되어 있는지, 목표 정점까지 도달할 수 있는지가 핵심입니다.`;
  } else if (hasCounting) {
    stage1Content = `경우의 수를 구하는 문제입니다. 작은 예제부터 손으로 계산해보면서 규칙을 찾아보세요. 중복을 제거하는 것이 중요합니다.`;
  } else if (hasSort) {
    stage1Content = `정렬 문제입니다. 어떤 기준으로 정렬해야 하는지, 정렬 후 무엇을 해야 하는지 명확히 파악하세요.`;
  } else if (hasSearch) {
    stage1Content = `특정 값을 찾거나 조건을 만족하는 요소를 탐색하는 문제입니다. 전체를 탐색해야 하는지, 효율적인 방법이 있는지 고민해보세요.`;
  } else if (hasArray) {
    stage1Content = `배열/수열을 다루는 문제입니다. 각 원소의 관계와 순서가 중요합니다. 예제를 직접 따라가며 패턴을 찾아보세요.`;
  } else if (hasString) {
    stage1Content = `문자열 처리 문제입니다. 각 문자를 어떻게 처리할지, 부분 문자열을 어떻게 다룰지가 핵심입니다.`;
  } else {
    stage1Content = `이 문제는 **${category || "알고리즘"}** 유형입니다. 입력과 출력의 관계를 파악하고, 예제를 통해 규칙을 찾아보세요.`;
  }
  
  hints.push({
    tier: "BRONZE",
    stage: 1,
    title: "문제 파악",
    content: stage1Content,
  });
  
  // Stage 2: 접근 방법 힌트 (SILVER 이상)
  if (hintCount >= 2) {
    let approach = "";
    
    if (category.includes("스택") || category.includes("큐") || hasParen) {
      approach = "**스택** 자료구조를 사용하세요. 여는 괄호는 push, 닫는 괄호가 나오면 스택의 top과 비교하여 짝이 맞는지 확인합니다.";
    } else if (category.includes("힙")) {
      if (hasMax) {
        approach = "**최대 힙**을 사용하여 가장 큰 값을 빠르게 찾으세요. 삽입/삭제가 O(log N)으로 가능합니다.";
      } else if (hasMin) {
        approach = "**최소 힙**을 사용하여 가장 작은 값을 빠르게 찾으세요. 우선순위 큐를 활용하면 효율적입니다.";
      } else {
        approach = "**힙(우선순위 큐)** 을 활용하세요. 최댓값/최솟값을 O(log N) 시간에 처리할 수 있습니다.";
      }
    } else if (category.includes("해시")) {
      approach = "**해시맵(딕셔너리)** 을 사용하세요. 값의 빈도를 세거나 O(1) 시간에 존재 여부를 확인할 수 있습니다.";
    } else if (category.includes("정렬") || hasSort) {
      approach = "먼저 **정렬**을 수행하세요. 정렬 후에는 인접한 원소끼리 비교하거나 이분 탐색을 적용할 수 있습니다.";
    } else if (category.includes("그래프") || category.includes("BFS") || category.includes("DFS") || hasGraph) {
      if (statement.includes("최단") || statement.includes("최소")) {
        approach = "**BFS(너비 우선 탐색)** 을 사용하세요. 시작점에서 목표까지의 최단 거리를 찾을 수 있습니다.";
      } else {
        approach = "**DFS(깊이 우선 탐색)** 또는 **BFS**를 사용하세요. 모든 정점을 방문하거나 연결 요소를 찾는 데 유용합니다.";
      }
    } else if (category.includes("동적계획법") || hasCounting) {
      approach = "**동적계획법(DP)** 을 사용하세요. dp[i]를 정의하고, 이전 상태로부터 현재 상태를 계산하는 점화식을 세워보세요.";
    } else if (category.includes("이분탐색")) {
      approach = "**이분 탐색**을 활용하세요. 데이터를 정렬한 후 left, right 포인터로 범위를 좁혀가며 O(log N) 시간에 찾습니다.";
    } else if (category.includes("탐욕법")) {
      if (hasMax) {
        approach = "**탐욕법**: 매 순간 가장 큰 값을 선택하는 것이 최적인지 확인하세요. 국소 최적이 전역 최적인지 증명이 필요합니다.";
      } else if (hasMin) {
        approach = "**탐욕법**: 매 순간 가장 작은 값을 선택하세요. 정렬 후 순서대로 선택하는 것이 최적일 수 있습니다.";
      } else {
        approach = "**탐욕법**: 매 단계에서 최선의 선택을 하세요. 정렬 후 조건에 맞는 것부터 선택하면 됩니다.";
      }
    } else {
      approach = `문제의 제약 조건을 보고 시간 복잡도를 계산하세요. N의 크기에 따라 O(N), O(N log N), O(N²) 중 선택해야 합니다.`;
    }
    
    hints.push({
      tier: "SILVER",
      stage: 2,
      title: "해결 전략",
      content: approach,
    });
  }
  
  // Stage 3: 구현 세부사항 힌트 (GOLD 이상)
  if (hintCount >= 3) {
    let implementation = "";
    
    if (hasParen) {
      implementation = "스택이 비어있을 때 닫는 괄호가 나오면 바로 'NO'입니다. 문자열을 모두 처리한 후 스택이 비어있으면 'YES', 아니면 'NO'입니다.";
    } else if (hasGraph) {
      implementation = "인접 리스트로 그래프를 표현하고, visited 배열로 방문 체크를 하세요. 큐(BFS) 또는 재귀(DFS)를 사용합니다.";
    } else if (hasCounting && category.includes("동적계획법")) {
      implementation = "dp[0] = 1로 초기화하고, dp[i] = dp[i-1] + dp[i-2] + ... 형태의 점화식을 세우세요. 결과가 클 수 있으니 모듈러 연산에 주의하세요.";
    } else if (hasMax || hasMin) {
      implementation = "최댓값/최솟값 변수를 초기화할 때 적절한 값을 설정하세요. 힙을 사용한다면 삽입 후 top을 확인하면 됩니다.";
    } else if (hasSort) {
      implementation = "내장 정렬 함수를 사용하되, 문제 조건에 맞는 비교 함수를 작성하세요. 안정 정렬이 필요한지 확인하세요.";
    } else if (hasSearch && category.includes("이분탐색")) {
      implementation = "mid = (left + right) / 2로 중간값을 구하고, 조건에 따라 left = mid + 1 또는 right = mid - 1로 범위를 좁힙니다.";
    } else if (hasArray) {
      implementation = "배열의 **인덱스 범위**를 항상 확인하세요. 0부터 n-1까지가 유효하며, 범위를 벗어나면 런타임 에러가 발생합니다.";
    } else {
      implementation = "**엣지 케이스**를 확인하세요: N=1일 때, 최댓값/최솟값일 때, 중복이 있을 때 등을 테스트해보세요.";
    }
    
    hints.push({
      tier: "GOLD",
      stage: 3,
      title: "구현 상세",
      content: implementation,
    });
  }
  
  return hints;
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
          "rule_based_auto",
          hint.stage * 30, // 1단계: 30초, 2단계: 60초, 3단계: 90초
        ]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ 힌트 저장 실패 (문제 ID: ${problemId}):`, error.message);
    return false;
  } finally {
    client.release();
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("🚀 규칙 기반 힌트 생성 시작\n");

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
      const requiredHintCount = getHintCountByTier(problem.tier);
      
      console.log(`\n📝 [${problem.id}] ${problem.title}`);
      console.log(`   난이도: ${problem.tier} (레벨 ${problem.level})`);
      console.log(`   카테고리: ${problem.categories?.join(", ") || "없음"}`);
      console.log(`   기존 힌트: ${hintCount}개, 필요 힌트: ${requiredHintCount}개`);

      // statement가 없으면 스킵
      if (!problem.statement || problem.statement.trim() === "") {
        console.log(`   ⏭️  statement 없음`);
        skippedCount++;
        continue;
      }

      // 이미 충분한 힌트가 있으면 스킵
      if (hintCount >= requiredHintCount) {
        console.log(`   ⏭️  힌트가 이미 충분함 (${hintCount}/${requiredHintCount})`);
        skippedCount++;
        continue;
      }

      // 힌트 생성
      const hints = generateHintsForProblem(problem, requiredHintCount);

      console.log(`   💡 생성된 힌트:`);
      hints.forEach((h, i) => {
        console.log(`      ${i + 1}. [${h.tier}/stage ${h.stage}] ${h.title}`);
      });

      // 힌트 저장
      const success = await saveHints(problem.id, hints);
      if (success) {
        console.log(`   ✅ 저장 완료`);
        processedCount++;
      } else {
        errorCount++;
      }

      // 부하 방지를 위한 짧은 딜레이
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ 힌트 생성 완료!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   처리됨: ${processedCount}개`);
    console.log(`   스킵: ${skippedCount}개`);
    console.log(`   실패: ${errorCount}개`);
    console.log();
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

