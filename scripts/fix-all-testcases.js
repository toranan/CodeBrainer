const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 전체 문제 테스트케이스 검증 및 수정\n');

  // 1. 모든 문제 조회
  const { data: problems, error: problemsError } = await supabase
    .from('problems')
    .select('id, slug, title')
    .not('constraints', 'is', null)
    .order('id');

  if (problemsError) {
    console.error('❌ 문제 조회 실패:', problemsError.message);
    return;
  }

  console.log(`📊 전체 문제: ${problems.length}개\n`);

  let fixedCount = 0;
  let alreadyOkCount = 0;
  let failedCount = 0;

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];

    console.log(`[${i + 1}/${problems.length}] ${problem.slug} (ID: ${problem.id})`);

    // 2. DB의 테스트케이스 조회
    const { data: dbTests } = await supabase
      .from('problem_tests')
      .select('*')
      .eq('problem_id', problem.id)
      .order('case_no');

    // 3. 스토리지의 테스트 파일 조회
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('codebrainer-problems')
      .list(`problems/${problem.slug}/tests`, { limit: 100 });

    if (storageError || !storageFiles) {
      console.log(`   ❌ 스토리지 조회 실패: ${storageError?.message}`);
      failedCount++;
      continue;
    }

    const inputFiles = storageFiles.filter(f => f.name.endsWith('.in'));
    const outputFiles = storageFiles.filter(f => f.name.endsWith('.out'));

    // 스토리지에서 사용 가능한 테스트 번호 추출
    const availableTestNums = inputFiles
      .map(f => f.name.match(/^(\d+)\.in$/))
      .filter(match => match)
      .map(match => parseInt(match[1]))
      .filter(num => outputFiles.some(f => f.name === `${num}.out`))
      .sort((a, b) => a - b);

    console.log(`   💾 DB: ${dbTests?.length || 0}개, 📦 Storage: ${availableTestNums.length}개 (${availableTestNums.join(', ')})`);

    // 4. DB와 Storage 비교
    const dbTestNums = new Set((dbTests || []).map(t => t.case_no));
    const needToAdd = availableTestNums.filter(num => !dbTestNums.has(num));
    const needToDelete = (dbTests || []).filter(t => !availableTestNums.includes(t.case_no));

    if (needToAdd.length === 0 && needToDelete.length === 0) {
      console.log(`   ✅ 일치함`);
      alreadyOkCount++;
      continue;
    }

    console.log(`   🔧 수정 필요: 추가 ${needToAdd.length}개, 삭제 ${needToDelete.length}개`);

    // 5. 잘못된 테스트 삭제
    for (const test of needToDelete) {
      console.log(`      🗑️  삭제: case_no ${test.case_no} (경로: ${test.in_path})`);

      const { error: deleteError } = await supabase
        .from('problem_tests')
        .delete()
        .eq('id', test.id);

      if (deleteError) {
        console.log(`         ❌ 삭제 실패: ${deleteError.message}`);
      } else {
        console.log(`         ✅ 삭제 완료`);
      }
    }

    // 6. 부족한 테스트 추가
    for (const testNum of needToAdd) {
      const inputPath = `problems/${problem.slug}/tests/${testNum}.in`;
      const outputPath = `problems/${problem.slug}/tests/${testNum}.out`;

      console.log(`      ➕ 추가: case_no ${testNum}`);

      const { error: insertError } = await supabase
        .from('problem_tests')
        .insert({
          problem_id: problem.id,
          case_no: testNum,
          in_path: inputPath,
          out_path: outputPath,
          is_hidden: testNum > 2
        });

      if (insertError) {
        console.log(`         ❌ 추가 실패: ${insertError.message}`);
      } else {
        console.log(`         ✅ 추가 완료`);
      }
    }

    fixedCount++;

    // Rate limit 방지
    if ((i + 1) % 5 === 0) {
      console.log('   ⏸️  잠시 대기...\n');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('테스트케이스 검증 및 수정 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 이미 정상: ${alreadyOkCount}개`);
  console.log(`🔧 수정함: ${fixedCount}개`);
  console.log(`❌ 실패: ${failedCount}개`);
  console.log(`📊 전체: ${problems.length}개`);
  console.log('='.repeat(60));
}

main().catch(console.error);
