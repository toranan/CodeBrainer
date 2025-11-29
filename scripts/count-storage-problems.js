const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function countProblems(prefix = '', depth = 0) {
  const indent = '  '.repeat(depth);

  const { data: files, error } = await supabase
    .storage
    .from('codebrainer-problems')
    .list(prefix, { limit: 10000 });

  if (error) {
    console.log(`${indent}❌ 오류: ${error.message}`);
    return 0;
  }

  console.log(`${indent}📂 ${prefix || '/'}: ${files.length}개 항목`);

  let problemCount = 0;

  // problem-로 시작하는 폴더 개수
  const problemFolders = files.filter(f => f.name.startsWith('problem-'));
  if (problemFolders.length > 0) {
    console.log(`${indent}   ✅ problem- 폴더: ${problemFolders.length}개`);
    problemCount += problemFolders.length;
  }

  // 숫자로만 된 폴더 개수 (problems/1000 같은 형식)
  const numericFolders = files.filter(f => /^\d+$/.test(f.name));
  if (numericFolders.length > 0) {
    console.log(`${indent}   ✅ 숫자 폴더: ${numericFolders.length}개`);
    problemCount += numericFolders.length;
  }

  // 하위 폴더들 재귀 탐색 (최대 2단계까지만)
  if (depth < 2) {
    const folders = files.filter(f => f.id); // 폴더만
    for (const folder of folders.slice(0, 5)) { // 최대 5개만
      const subPath = prefix ? `${prefix}/${folder.name}` : folder.name;
      const subCount = await countProblems(subPath, depth + 1);
      problemCount += subCount;
    }

    if (folders.length > 5) {
      console.log(`${indent}   ... (${folders.length - 5}개 더 있음)`);
    }
  }

  return problemCount;
}

async function main() {
  console.log('🔍 Supabase Storage vs Database (problems 테이블) 비교\n');

  // 1. 데이터베이스에서 문제 목록 가져오기 (constraints 있는 것들)
  const { data: dbProblems, error: dbError } = await supabase
    .from('problems')
    .select('id, title, slug')
    .not('constraints', 'is', null)
    .order('id');

  if (dbError) {
    console.error('❌ DB 조회 실패:', dbError.message);
    return;
  }

  const dbProblemSlugs = new Set(dbProblems.map(p => p.slug));
  console.log(`💾 Database (problems 테이블): ${dbProblems.length}개`);

  // 2. 스토리지에서 문제 목록 가져오기
  const { data: storageFiles, error: storageError } = await supabase
    .storage
    .from('codebrainer-problems')
    .list('problems', { limit: 10000 });

  if (storageError) {
    console.error('❌ 스토리지 조회 실패:', storageError.message);
    return;
  }

  const storageProblemNames = storageFiles
    .filter(f => f.name.startsWith('problem-') || !f.name.includes('.'))
    .map(f => f.name);

  console.log(`📦 Storage (problems 폴더): ${storageProblemNames.length}개\n`);

  // 3. slug 기준으로 비교
  const inBothDB = dbProblems.filter(p => storageProblemNames.includes(p.slug));
  const inDBOnly = dbProblems.filter(p => !storageProblemNames.includes(p.slug));
  const inStorageOnly = storageProblemNames.filter(name => !dbProblemSlugs.has(name));

  console.log('='.repeat(60));
  console.log(`✅ DB + Storage 둘 다 존재: ${inBothDB.length}개`);
  console.log(`💾 DB에만 존재 (Storage 없음): ${inDBOnly.length}개`);
  console.log(`📦 Storage에만 존재 (DB 없음): ${inStorageOnly.length}개`);
  console.log('='.repeat(60));

  if (inDBOnly.length > 0) {
    console.log(`\n💾 DB에만 있는 문제 (Storage에 없음) - ${inDBOnly.length}개:`);
    inDBOnly.forEach(p => console.log(`   - ${p.slug} (ID: ${p.id}): ${p.title}`));
  }

  if (inStorageOnly.length > 0) {
    console.log(`\n📦 Storage에만 있는 항목 (DB에 없음) - ${inStorageOnly.length}개:`);
    inStorageOnly.forEach(name => console.log(`   - ${name}`));
  }

  if (inBothDB.length > 0) {
    console.log(`\n✅ 양쪽 모두 존재하는 문제 - ${inBothDB.length}개:`);
    inBothDB.slice(0, 10).forEach(p => console.log(`   - ${p.slug} (ID: ${p.id}): ${p.title}`));
    if (inBothDB.length > 10) {
      console.log(`   ... 외 ${inBothDB.length - 10}개`);
    }
  }
}

main().catch(console.error);
