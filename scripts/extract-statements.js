/**
 * problems 폴더에서 문제 설명만 추출하여 orchestrator storage로 복사
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.join(__dirname, "../problems");
const TARGET_DIR = path.join(__dirname, "../backend/orchestrator/storage/problems");

/**
 * 마크다운 파일에서 "## 문제 설명" 섹션만 추출
 */
function extractProblemStatement(content, problemTitle) {
  // 제목과 문제 설명만 추출
  const lines = content.split("\n");
  
  let result = [];
  let inProblemSection = false;
  let foundTitle = false;
  
  for (const line of lines) {
    // 제목 추출 (# 로 시작)
    if (line.startsWith("# ") && !foundTitle) {
      result.push(line);
      result.push("");
      foundTitle = true;
      continue;
    }
    
    // "## 문제 설명" 섹션 시작
    if (line.startsWith("## 문제 설명")) {
      inProblemSection = true;
      continue;
    }
    
    // 다른 섹션 시작 (## 입력, ## 출력 등)
    if (line.startsWith("## ") && inProblemSection) {
      break;
    }
    
    // 문제 설명 섹션 내용 수집
    if (inProblemSection) {
      result.push(line);
    }
  }
  
  // 마지막 공백 줄 제거
  while (result.length > 0 && result[result.length - 1].trim() === "") {
    result.pop();
  }
  
  return result.join("\n");
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log("📝 문제 설명 추출 시작\n");
  
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ 원본 폴더가 없습니다: ${SOURCE_DIR}`);
    return;
  }
  
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`❌ 대상 폴더가 없습니다: ${TARGET_DIR}`);
    return;
  }
  
  const sourceDirs = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📊 총 ${sourceDirs.length}개 문제 폴더 발견\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const dirName of sourceDirs) {
    const sourceStatementPath = path.join(SOURCE_DIR, dirName, "statement.md");
    const targetDirPath = path.join(TARGET_DIR, dirName);
    const targetStatementPath = path.join(targetDirPath, "statement.md");
    
    // 원본 파일이 없으면 스킵
    if (!fs.existsSync(sourceStatementPath)) {
      console.log(`⏭️  [${dirName}] 원본 statement.md 없음`);
      skipCount++;
      continue;
    }
    
    // 대상 폴더가 없으면 생성
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    
    try {
      // 원본 파일 읽기
      const content = fs.readFileSync(sourceStatementPath, "utf-8");
      
      // 제목 추출
      const titleMatch = content.match(/^# (.+)$/m);
      const title = titleMatch ? titleMatch[1] : dirName;
      
      // 문제 설명만 추출
      const extracted = extractProblemStatement(content, title);
      
      if (!extracted || extracted.trim() === "") {
        console.log(`⚠️  [${dirName}] ${title} - 문제 설명 없음`);
        errorCount++;
        continue;
      }
      
      // 대상 파일에 저장
      fs.writeFileSync(targetStatementPath, extracted, "utf-8");
      
      // 미리보기 (첫 100자)
      const preview = extracted.replace(/\n/g, " ").substring(0, 100);
      console.log(`✅ [${dirName}] ${title}`);
      console.log(`   → ${preview}${extracted.length > 100 ? "..." : ""}`);
      
      successCount++;
    } catch (error) {
      console.error(`❌ [${dirName}] 오류:`, error.message);
      errorCount++;
    }
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ 문제 설명 추출 완료!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   성공: ${successCount}개`);
  console.log(`   스킵: ${skipCount}개`);
  console.log(`   실패: ${errorCount}개`);
  console.log();
}

main();

