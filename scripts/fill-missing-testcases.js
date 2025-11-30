const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 테스트케이스 부족한 문제 찾기 및 채우기\n');

  // 1. DB에서 모든 문제 조회
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

  // 2. 각 문제의 테스트케이스 개수 확인
  const problemsNeedingTests = [];

  for (const problem of problems) {
    const { count, error } = await supabase
      .from('problem_tests')
      .select('*', { count: 'exact', head: true })
      .eq('problem_id', problem.id);

    if (error) {
      console.error(`❌ 테스트케이스 조회 실패 (문제 ${problem.id}):`, error.message);
      continue;
    }

    const testCount = count || 0;

    if (testCount < 5) {
      problemsNeedingTests.push({
        ...problem,
        currentTests: testCount,
        needed: 5 - testCount
      });
      console.log(`⚠️  ${problem.slug} (ID: ${problem.id}): ${testCount}/5 테스트케이스`);
    }
  }

  console.log(`\n📋 테스트케이스 부족한 문제: ${problemsNeedingTests.length}개`);
  console.log('='.repeat(60));

  if (problemsNeedingTests.length === 0) {
    console.log('✅ 모든 문제가 5개 이상의 테스트케이스를 가지고 있습니다!');
    return;
  }

  // 3. 스토리지에서 테스트케이스 파일 읽어서 채우기
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < problemsNeedingTests.length; i++) {
    const problem = problemsNeedingTests[i];

    console.log(`\n[${i + 1}/${problemsNeedingTests.length}] ${problem.slug} (ID: ${problem.id})`);
    console.log(`   현재: ${problem.currentTests}개, 필요: ${problem.needed}개 추가`);

    // 스토리지에서 tests 폴더 목록 조회
    const { data: testFiles, error: listError } = await supabase
      .storage
      .from('codebrainer-problems')
      .list(`problems/${problem.slug}/tests`, { limit: 100 });

    if (listError) {
      console.log(`   ❌ 스토리지 조회 실패: ${listError.message}`);
      failCount++;
      continue;
    }

    if (!testFiles || testFiles.length === 0) {
      console.log(`   ⚠️  스토리지에 테스트 폴더 없음`);
      failCount++;
      continue;
    }

    // input, output 파일 찾기 (.in, .out 형식)
    const inputFiles = testFiles.filter(f => f.name.endsWith('.in'));
    const outputFiles = testFiles.filter(f => f.name.endsWith('.out'));

    console.log(`   📁 스토리지 테스트: input ${inputFiles.length}개, output ${outputFiles.length}개`);

    // 테스트케이스 번호 추출 (1.in -> 1)
    const testNumbers = inputFiles
      .map(f => f.name.match(/^(\d+)\.in$/))
      .filter(match => match)
      .map(match => parseInt(match[1]))
      .sort((a, b) => a - b);

    if (testNumbers.length === 0) {
      console.log(`   ⚠️  테스트케이스 파일이 올바른 형식이 아님`);
      failCount++;
      continue;
    }

    console.log(`   📝 사용 가능한 테스트 번호: ${testNumbers.join(', ')}`);

    // 이미 있는 테스트 번호 확인
    const { data: existingTests } = await supabase
      .from('problem_tests')
      .select('case_no')
      .eq('problem_id', problem.id);

    const existingNumbers = new Set((existingTests || []).map(t => t.case_no));

    // 추가할 테스트 선택 (이미 있는 것 제외)
    const testsToAdd = testNumbers
      .filter(num => !existingNumbers.has(num))
      .slice(0, problem.needed);

    if (testsToAdd.length === 0) {
      console.log(`   ⚠️  추가할 새로운 테스트케이스 없음`);
      failCount++;
      continue;
    }

    console.log(`   ➕ 추가할 테스트: ${testsToAdd.join(', ')}`);

    // 테스트케이스 경로를 DB에 추가
    let addedCount = 0;

    for (const testNum of testsToAdd) {
      // 스토리지 경로 생성
      const inputPath = `problems/${problem.slug}/tests/${testNum}.in`;
      const outputPath = `problems/${problem.slug}/tests/${testNum}.out`;

      // DB에 삽입 (경로만 저장)
      const { error: insertError } = await supabase
        .from('problem_tests')
        .insert({
          problem_id: problem.id,
          case_no: testNum,
          in_path: inputPath,
          out_path: outputPath,
          is_hidden: testNum > 2 // 1, 2번은 공개, 나머지는 숨김
        });

      if (insertError) {
        console.log(`      ❌ 테스트 ${testNum} 삽입 실패: ${insertError.message}`);
      } else {
        console.log(`      ✅ 테스트 ${testNum} 추가 완료 (${inputPath})`);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(`   ✅ ${addedCount}개 테스트케이스 추가 성공`);
      successCount++;
    } else {
      console.log(`   ❌ 테스트케이스 추가 실패`);
      failCount++;
    }

    // API rate limit 방지
    if ((i + 1) % 5 === 0) {
      console.log('\n   ⏸️  잠시 대기...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('테스트케이스 채우기 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${successCount}개 문제`);
  console.log(`❌ 실패: ${failCount}개 문제`);
  console.log(`📊 전체: ${problemsNeedingTests.length}개 문제`);
  console.log('='.repeat(60));
}

main().catch(console.error);
