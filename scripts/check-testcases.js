const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 테스트케이스 현황 확인\n');

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

  // 2. 각 문제별 테스트케이스 개수 확인
  const testCaseStats = {
    '0개': [],
    '1-4개': [],
    '5개 이상': []
  };

  for (const problem of problems) {
    const { data: testCases, error } = await supabase
      .from('problem_tests')
      .select('id, case_no, is_hidden')
      .eq('problem_id', problem.id)
      .order('case_no');

    const count = testCases ? testCases.length : 0;

    if (count === 0) {
      testCaseStats['0개'].push({ ...problem, testCount: count });
    } else if (count < 5) {
      testCaseStats['1-4개'].push({ ...problem, testCount: count, tests: testCases });
    } else {
      testCaseStats['5개 이상'].push({ ...problem, testCount: count });
    }
  }

  // 3. 결과 출력
  console.log('='.repeat(60));
  console.log('테스트케이스 현황:');
  console.log('='.repeat(60));
  console.log(`✅ 5개 이상: ${testCaseStats['5개 이상'].length}개 문제`);
  console.log(`⚠️  1-4개: ${testCaseStats['1-4개'].length}개 문제`);
  console.log(`❌ 0개: ${testCaseStats['0개'].length}개 문제`);
  console.log('='.repeat(60));

  if (testCaseStats['5개 이상'].length > 0) {
    console.log(`\n✅ 5개 이상 보유 (${testCaseStats['5개 이상'].length}개):`);
    testCaseStats['5개 이상'].slice(0, 10).forEach(p => {
      console.log(`   - ${p.slug} (ID: ${p.id}): ${p.testCount}개`);
    });
    if (testCaseStats['5개 이상'].length > 10) {
      console.log(`   ... 외 ${testCaseStats['5개 이상'].length - 10}개`);
    }
  }

  if (testCaseStats['1-4개'].length > 0) {
    console.log(`\n⚠️  1-4개 보유 (${testCaseStats['1-4개'].length}개):`);
    testCaseStats['1-4개'].forEach(p => {
      const testNumbers = p.tests.map(t => t.case_no).join(', ');
      console.log(`   - ${p.slug} (ID: ${p.id}): ${p.testCount}개 (번호: ${testNumbers})`);
    });
  }

  if (testCaseStats['0개'].length > 0) {
    console.log(`\n❌ 테스트케이스 없음 (${testCaseStats['0개'].length}개):`);
    testCaseStats['0개'].slice(0, 10).forEach(p => {
      console.log(`   - ${p.slug} (ID: ${p.id})`);
    });
    if (testCaseStats['0개'].length > 10) {
      console.log(`   ... 외 ${testCaseStats['0개'].length - 10}개`);
    }
  }
}

main().catch(console.error);
