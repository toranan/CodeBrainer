const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// DB 경로에 tests/ 폴더가 없는 경우를 수정
async function main() {
  console.log('🔧 테스트케이스 경로 수정 시작\n');

  // 모든 문제 조회
  const { data: problems } = await supabase
    .from('problems')
    .select('id, slug')
    .not('constraints', 'is', null)
    .order('id');

  let fixedCount = 0;

  for (const problem of problems) {
    // 각 문제의 테스트케이스 조회
    const { data: tests } = await supabase
      .from('problem_tests')
      .select('id, case_no, in_path, out_path')
      .eq('problem_id', problem.id)
      .order('case_no');

    if (!tests || tests.length === 0) continue;

    for (const test of tests) {
      // tests/ 폴더가 없는 경로인지 확인
      // 예: problems/problem-15829/1.in -> problems/problem-15829/tests/1.in
      const needsFix = test.in_path && !test.in_path.includes('/tests/');

      if (needsFix) {
        // 파일명 추출 (예: 1.in)
        const inFileName = test.in_path.split('/').pop();
        const outFileName = test.out_path.split('/').pop();

        // 새로운 경로 생성
        const newInPath = `problems/${problem.slug}/tests/${inFileName}`;
        const newOutPath = `problems/${problem.slug}/tests/${outFileName}`;

        // Storage에 새 경로의 파일이 실제로 존재하는지 확인
        const { data: inData, error: inError } = await supabase
          .storage
          .from('codebrainer-problems')
          .download(newInPath);

        const { data: outData, error: outError } = await supabase
          .storage
          .from('codebrainer-problems')
          .download(newOutPath);

        if (!inError && !outError && inData && outData) {
          // 파일이 존재하면 DB 경로 업데이트
          const { error: updateError } = await supabase
            .from('problem_tests')
            .update({
              in_path: newInPath,
              out_path: newOutPath
            })
            .eq('id', test.id);

          if (!updateError) {
            console.log(`✅ ${problem.slug} case ${test.case_no}: ${test.in_path} -> ${newInPath}`);
            fixedCount++;
          } else {
            console.log(`❌ ${problem.slug} case ${test.case_no}: 업데이트 실패 - ${updateError.message}`);
          }
        } else {
          console.log(`⚠️  ${problem.slug} case ${test.case_no}: Storage에 파일 없음 (${newInPath})`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 총 ${fixedCount}개 테스트케이스 경로 수정 완료`);
  console.log('='.repeat(60));
}

main().catch(console.error);
