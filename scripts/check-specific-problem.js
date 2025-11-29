const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const slug = 'problem-1010';

  console.log(`🔍 ${slug} 상세 확인\n`);

  // 1. DB에서 문제 정보 조회
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select('id, slug, title')
    .eq('slug', slug)
    .single();

  if (problemError || !problem) {
    console.log(`❌ 문제를 찾을 수 없음: ${problemError?.message}`);
    return;
  }

  console.log(`📝 문제: ${problem.title} (ID: ${problem.id})\n`);

  // 2. DB의 테스트케이스 조회
  const { data: dbTests, error: dbError } = await supabase
    .from('problem_tests')
    .select('*')
    .eq('problem_id', problem.id)
    .order('case_no');

  console.log(`💾 DB 테스트케이스: ${dbTests?.length || 0}개`);
  if (dbTests && dbTests.length > 0) {
    dbTests.forEach(test => {
      console.log(`   - case_no: ${test.case_no}, hidden: ${test.is_hidden}`);
      console.log(`     in: ${test.in_path}`);
      console.log(`     out: ${test.out_path}`);
    });
  }

  // 3. 스토리지의 테스트 파일 조회
  const { data: storageFiles, error: storageError } = await supabase
    .storage
    .from('codebrainer-problems')
    .list(`problems/${slug}/tests`, { limit: 100 });

  console.log(`\n📦 Storage 테스트 파일: ${storageFiles?.length || 0}개`);
  if (storageFiles && storageFiles.length > 0) {
    const inputs = storageFiles.filter(f => f.name.endsWith('.in')).sort();
    const outputs = storageFiles.filter(f => f.name.endsWith('.out')).sort();

    console.log(`   Input 파일 (${inputs.length}개): ${inputs.map(f => f.name).join(', ')}`);
    console.log(`   Output 파일 (${outputs.length}개): ${outputs.map(f => f.name).join(', ')}`);
  }
}

main().catch(console.error);
