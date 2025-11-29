const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔄 DB 테이블과 Storage 동기화\n');

  // 1. DB에서 문제 목록 가져오기
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
  console.log(`💾 Database: ${dbProblems.length}개`);

  // 2. Storage에서 문제 목록 가져오기
  const { data: storageFiles, error: storageError } = await supabase
    .storage
    .from('codebrainer-problems')
    .list('problems', { limit: 10000 });

  if (storageError) {
    console.error('❌ Storage 조회 실패:', storageError.message);
    return;
  }

  const storageProblemNames = storageFiles
    .filter(f => f.name.startsWith('problem-') || !f.name.includes('.'))
    .map(f => f.name);

  console.log(`📦 Storage: ${storageProblemNames.length}개\n`);

  // 3. 비교
  const inDBOnly = dbProblems.filter(p => !storageProblemNames.includes(p.slug));
  const inStorageOnly = storageProblemNames.filter(name => !dbProblemSlugs.has(name));

  console.log('='.repeat(60));
  console.log(`💾 DB에만 존재 (Storage 없음): ${inDBOnly.length}개`);
  console.log(`📦 Storage에만 존재 (DB 없음): ${inStorageOnly.length}개`);
  console.log('='.repeat(60));

  if (inDBOnly.length === 0 && inStorageOnly.length === 0) {
    console.log('\n✅ DB와 Storage가 이미 일치합니다!');
    return;
  }

  // 4. DB에만 있는 문제 삭제 확인
  if (inDBOnly.length > 0) {
    console.log(`\n💾 DB에서 삭제할 문제 (${inDBOnly.length}개):`);
    inDBOnly.forEach(p => console.log(`   - ${p.slug} (ID: ${p.id}): ${p.title}`));

    console.log('\n🗑️  DB에서 삭제 중...');

    for (const problem of inDBOnly) {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', problem.id);

      if (error) {
        console.log(`   ❌ ${problem.slug} 삭제 실패: ${error.message}`);
      } else {
        console.log(`   ✅ ${problem.slug} 삭제 완료`);
      }
    }
  }

  // 5. Storage에만 있는 문제 삭제 확인
  if (inStorageOnly.length > 0) {
    console.log(`\n📦 Storage에서 삭제할 항목 (${inStorageOnly.length}개):`);
    inStorageOnly.forEach(name => console.log(`   - ${name}`));

    console.log('\n🗑️  Storage에서 삭제 중...');

    for (const folderName of inStorageOnly) {
      // 폴더 내 모든 파일 목록 가져오기
      const { data: files, error: listError } = await supabase
        .storage
        .from('codebrainer-problems')
        .list(`problems/${folderName}`, { limit: 10000 });

      if (listError) {
        console.log(`   ❌ ${folderName} 파일 목록 조회 실패: ${listError.message}`);
        continue;
      }

      // 모든 파일 경로 생성
      const filePaths = [];

      // 재귀적으로 모든 하위 파일 찾기
      async function listAllFiles(prefix) {
        const { data, error } = await supabase
          .storage
          .from('codebrainer-problems')
          .list(prefix, { limit: 10000 });

        if (error || !data) return;

        for (const item of data) {
          const fullPath = `${prefix}/${item.name}`;

          if (item.id) {
            // 폴더인 경우 재귀
            await listAllFiles(fullPath);
          } else {
            // 파일인 경우 추가
            filePaths.push(fullPath);
          }
        }
      }

      await listAllFiles(`problems/${folderName}`);

      if (filePaths.length > 0) {
        console.log(`   🗂️  ${folderName}: ${filePaths.length}개 파일 삭제 중...`);

        // 파일 삭제
        const { error: deleteError } = await supabase
          .storage
          .from('codebrainer-problems')
          .remove(filePaths);

        if (deleteError) {
          console.log(`   ❌ ${folderName} 삭제 실패: ${deleteError.message}`);
        } else {
          console.log(`   ✅ ${folderName} 삭제 완료`);
        }
      } else {
        console.log(`   ⚠️  ${folderName}: 파일이 없음, 건너뜀`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('동기화 완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
