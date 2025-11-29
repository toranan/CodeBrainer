const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';
const PROBLEMS_DIR = path.join(__dirname, '..', 'problems2');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 힌트 파일을 데이터베이스에 업로드합니다...\n');

  // 모든 힌트 조회
  const { data: hints, error } = await supabase
    .from('problem_hints')
    .select('id, problem_id, stage, content_md')
    .order('problem_id', { ascending: true })
    .order('stage', { ascending: true });

  if (error) {
    console.error('❌ 힌트 조회 실패:', error);
    return;
  }

  console.log(`✅ 총 ${hints.length}개의 힌트를 찾았습니다.\n`);

  // 경로가 아닌 실제 내용이 있는 힌트 필터링
  const pathHints = hints.filter(hint => {
    const content = hint.content_md || '';
    // 경로 형식이거나 매우 짧은 내용인 경우
    return content.startsWith('problems/') && content.includes('.md');
  });

  console.log(`📝 ${pathHints.length}개의 힌트가 경로로 되어 있습니다.`);
  console.log(`📂 problems2 폴더에서 힌트 파일을 읽어서 업데이트합니다.\n`);

  let successCount = 0;
  let failCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < pathHints.length; i++) {
    const hint = pathHints[i];
    const problemId = hint.problem_id;
    const stage = hint.stage;

    // problems2/problem-{id}/hints/{stage}.md 형식으로 파일 찾기
    const hintFilePath = path.join(PROBLEMS_DIR, `problem-${problemId}`, 'hints', `${stage}.md`);

    console.log(`[${i + 1}/${pathHints.length}] 힌트 ID ${hint.id} (문제=${problemId}, 단계=${stage})`);
    console.log(`  파일: ${hintFilePath}`);

    // 파일이 존재하는지 확인
    if (!fs.existsSync(hintFilePath)) {
      console.log(`  ⚠️  파일을 찾을 수 없습니다.\n`);
      notFoundCount++;
      continue;
    }

    // 파일 읽기
    try {
      const content = fs.readFileSync(hintFilePath, 'utf-8');

      if (!content || content.trim().length === 0) {
        console.log(`  ⚠️  파일이 비어있습니다.\n`);
        notFoundCount++;
        continue;
      }

      console.log(`  ✅ ${content.length}자 읽음`);

      // 데이터베이스 업데이트
      const { error: updateError } = await supabase
        .from('problem_hints')
        .update({ content_md: content })
        .eq('id', hint.id);

      if (updateError) {
        console.log(`  ❌ 업데이트 실패: ${updateError.message}\n`);
        failCount++;
        continue;
      }

      console.log(`  ✅ 데이터베이스 업데이트 완료\n`);
      successCount++;

      // 10개마다 잠시 대기 (API rate limit 방지)
      if ((i + 1) % 10 === 0) {
        console.log('  ⏸️  잠시 대기 중...\n');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (readError) {
      console.log(`  ❌ 파일 읽기 실패: ${readError.message}\n`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('힌트 업로드 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${successCount}`);
  console.log(`❌ 실패: ${failCount}`);
  console.log(`⚠️  파일 없음: ${notFoundCount}`);
  console.log(`📊 전체: ${pathHints.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
