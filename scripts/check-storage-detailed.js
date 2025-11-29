const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkStorage() {
  console.log('🔍 스토리지 구조 확인 중...\n');

  // codebrainer-problems 버킷 확인
  const { data: files, error } = await supabase
    .storage
    .from('codebrainer-problems')
    .list('', { limit: 10000 });

  if (error) {
    console.error('❌ 버킷 조회 실패:', error.message);
    return;
  }

  console.log(`📦 codebrainer-problems 버킷 최상위: ${files.length}개 항목\n`);

  // problem- 으로 시작하는 폴더들 찾기
  const problemFolders = files.filter(f => f.name.startsWith('problem-'));
  console.log(`📁 problem- 폴더: ${problemFolders.length}개`);

  // 각 problem- 폴더 내부 확인
  let totalProblems = 0;
  const sampleFolders = problemFolders.slice(0, 3);

  for (const folder of sampleFolders) {
    const { data: subFiles, error: subError } = await supabase
      .storage
      .from('codebrainer-problems')
      .list(folder.name, { limit: 10000 });

    if (!subError && subFiles) {
      const subProblems = subFiles.filter(f => f.name.startsWith('problem-'));
      console.log(`   ${folder.name}: ${subProblems.length}개 하위 문제`);
    }
  }

  // 다른 폴더들 확인
  console.log('\n📋 기타 폴더/파일:');
  files.filter(f => !f.name.startsWith('problem-')).forEach(f => {
    console.log(`   - ${f.name}`);
  });

  // problems 폴더가 있는지 확인
  const problemsFolder = files.find(f => f.name === 'problems');
  if (problemsFolder) {
    console.log('\n📁 problems 폴더 발견! 내부 확인 중...');
    const { data: problemsContent, error: problemsError } = await supabase
      .storage
      .from('codebrainer-problems')
      .list('problems', { limit: 10000 });

    if (!problemsError && problemsContent) {
      const problemDirs = problemsContent.filter(f => f.name.match(/^\d+$/));
      console.log(`   ✅ problems 폴더 안에 ${problemDirs.length}개 문제 폴더`);
      console.log(`   예시: ${problemDirs.slice(0, 5).map(f => f.name).join(', ')}...`);
      totalProblems = problemDirs.length;
    }
  }

  console.log(`\n📊 총 스토리지 문제 수: ${totalProblems}개`);
}

checkStorage().catch(console.error);
