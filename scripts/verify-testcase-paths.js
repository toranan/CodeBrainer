const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 테스트케이스 경로 검증 시작\n');

  // 모든 문제 조회
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

  const issues = [];
  let checkedCount = 0;

  for (const problem of problems) {
    checkedCount++;
    console.log(`[${checkedCount}/${problems.length}] ${problem.slug} (ID: ${problem.id})`);

    // DB에서 테스트케이스 조회
    const { data: tests } = await supabase
      .from('problem_tests')
      .select('case_no, in_path, out_path')
      .eq('problem_id', problem.id)
      .order('case_no');

    if (!tests || tests.length === 0) {
      console.log('   ⚠️  테스트케이스 없음');
      continue;
    }

    // 각 테스트케이스 파일이 실제로 존재하는지 확인
    for (const test of tests) {
      // input 파일 확인
      const { data: inData, error: inError } = await supabase
        .storage
        .from('codebrainer-problems')
        .download(test.in_path);

      if (inError || !inData) {
        issues.push({
          problem: problem.slug,
          problemId: problem.id,
          caseNo: test.case_no,
          type: 'input',
          path: test.in_path,
          error: inError?.message || 'File not found'
        });
        console.log(`   ❌ case ${test.case_no}: ${test.in_path} - 없음`);
      }

      // output 파일 확인
      const { data: outData, error: outError } = await supabase
        .storage
        .from('codebrainer-problems')
        .download(test.out_path);

      if (outError || !outData) {
        issues.push({
          problem: problem.slug,
          problemId: problem.id,
          caseNo: test.case_no,
          type: 'output',
          path: test.out_path,
          error: outError?.message || 'File not found'
        });
        console.log(`   ❌ case ${test.case_no}: ${test.out_path} - 없음`);
      }
    }

    if (issues.filter(i => i.problem === problem.slug).length === 0) {
      console.log(`   ✅ ${tests.length}개 모두 정상`);
    }
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('검증 결과:');
  console.log('='.repeat(60));
  console.log(`총 ${problems.length}개 문제 중 ${issues.length}개 파일 문제 발견`);

  if (issues.length > 0) {
    console.log('\n❌ 문제가 있는 파일:');
    const grouped = {};
    issues.forEach(i => {
      if (!grouped[i.problem]) grouped[i.problem] = [];
      grouped[i.problem].push(i);
    });

    Object.entries(grouped).forEach(([slug, problemIssues]) => {
      console.log(`\n  ${slug}:`);
      problemIssues.forEach(i => {
        console.log(`    - case ${i.caseNo} (${i.type}): ${i.path}`);
        console.log(`      에러: ${i.error}`);
      });
    });
  } else {
    console.log('\n✅ 모든 테스트케이스 파일이 정상입니다!');
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
