const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkStorage() {
  console.log('🔍 스토리지 확인 중...\n');

  // problems 버킷의 파일 목록 조회
  const { data: files, error } = await supabase
    .storage
    .from('problems')
    .list('', {
      limit: 10000,
      offset: 0,
    });

  if (error) {
    console.error('❌ 스토리지 조회 실패:', error.message);
    return;
  }

  console.log(`📦 problems 버킷 최상위: ${files.length}개 항목\n`);

  // 각 폴더 확인
  const problemFolders = files.filter(f => f.name.startsWith('problem-'));

  console.log(`📁 문제 폴더 개수: ${problemFolders.length}개`);
  console.log(`   (예: ${problemFolders.slice(0, 5).map(f => f.name).join(', ')}...)\n`);

  // 샘플로 몇 개 폴더 내부 확인
  if (problemFolders.length > 0) {
    const sampleFolder = problemFolders[0].name;
    const { data: subFiles, error: subError } = await supabase
      .storage
      .from('problems')
      .list(sampleFolder, { limit: 100 });

    if (!subError && subFiles) {
      console.log(`📄 샘플 폴더 (${sampleFolder}) 내용: ${subFiles.length}개 파일`);
      console.log(`   ${subFiles.map(f => f.name).join(', ')}`);
    }
  }
}

checkStorage().catch(console.error);
