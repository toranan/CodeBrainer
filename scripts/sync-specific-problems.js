const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔄 DB와 Storage 동기화 (3개 문제)\n');

  // 1. DB에서 삭제할 문제 (Storage에 없는 2개)
  const dbSlugsToDelete = ['problem-2839', 'problem-1149'];

  console.log('💾 DB에서 삭제할 문제:');
  for (const slug of dbSlugsToDelete) {
    // slug로 문제 조회
    const { data: problem, error: findError } = await supabase
      .from('problems')
      .select('id, slug, title')
      .eq('slug', slug)
      .single();

    if (findError || !problem) {
      console.log(`   ⚠️  ${slug}: 찾을 수 없음`);
      continue;
    }

    console.log(`   - ${problem.slug} (ID: ${problem.id}): ${problem.title}`);

    // 삭제
    const { error: deleteError } = await supabase
      .from('problems')
      .delete()
      .eq('id', problem.id);

    if (deleteError) {
      console.log(`      ❌ 삭제 실패: ${deleteError.message}`);
    } else {
      console.log(`      ✅ DB에서 삭제 완료`);
    }
  }

  // 2. Storage에서 삭제할 문제 (DB에 없는 1개)
  const storageFoldersToDelete = ['problem-30863'];

  console.log(`\n📦 Storage에서 삭제할 폴더:`);
  for (const folderName of storageFoldersToDelete) {
    console.log(`   - ${folderName}`);

    // 폴더 내 모든 파일 경로 수집
    const filePaths = [];

    async function listAllFiles(prefix) {
      const { data, error } = await supabase
        .storage
        .from('codebrainer-problems')
        .list(prefix, { limit: 10000 });

      if (error) {
        console.log(`      ❌ 파일 목록 조회 실패: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        return;
      }

      for (const item of data) {
        const fullPath = `${prefix}/${item.name}`;

        // Supabase storage에서 폴더는 id가 null
        if (item.id === null) {
          // 파일
          filePaths.push(fullPath);
        } else {
          // 폴더 - 재귀
          await listAllFiles(fullPath);
        }
      }
    }

    await listAllFiles(`problems/${folderName}`);

    if (filePaths.length > 0) {
      console.log(`      📁 ${filePaths.length}개 파일 삭제 중...`);

      const { error: deleteError } = await supabase
        .storage
        .from('codebrainer-problems')
        .remove(filePaths);

      if (deleteError) {
        console.log(`      ❌ 삭제 실패: ${deleteError.message}`);
      } else {
        console.log(`      ✅ Storage에서 삭제 완료`);
      }
    } else {
      console.log(`      ⚠️  파일이 없거나 이미 삭제됨`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 동기화 완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
