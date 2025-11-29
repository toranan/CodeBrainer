const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkBackups() {
  console.log('🔍 백업 테이블 및 데이터 확인 중...\n');

  // 백업 테이블 후보들
  const backupTables = [
    'problems_backup',
    'problems_backup_before_delete',
    'problems_bak',
    'problems_old'
  ];

  console.log('📋 백업 테이블 존재 여부 확인:\n');

  for (const tableName of backupTables) {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ ${tableName}: 존재함 (${count}개 레코드)`);
    } else {
      console.log(`❌ ${tableName}: 없음 (${error.message})`);
    }
  }

  // 현재 problems 테이블 상태
  console.log('\n📊 현재 problems 테이블 상태:\n');

  const { count: totalCount } = await supabase
    .from('problems')
    .select('*', { count: 'exact', head: true });

  console.log(`전체 문제 수: ${totalCount}`);

  const { count: withConstraints } = await supabase
    .from('problems')
    .select('*', { count: 'exact', head: true })
    .not('constraints', 'is', null);

  console.log(`constraints 있는 문제: ${withConstraints}`);

  const { count: withoutConstraints } = await supabase
    .from('problems')
    .select('*', { count: 'exact', head: true })
    .is('constraints', null);

  console.log(`constraints 없는 문제: ${withoutConstraints}`);

  // problems2 폴더 확인
  const problemsDir = path.join(__dirname, '..', 'problems2');

  if (fs.existsSync(problemsDir)) {
    const dirs = fs.readdirSync(problemsDir).filter(f => f.startsWith('problem-'));
    console.log(`\n📁 로컬 problems2 폴더: ${dirs.length}개 문제`);
    console.log('   → 복구 가능: problems2 폴더에서 재업로드 가능');
  } else {
    console.log(`\n⚠️  로컬 problems2 폴더를 찾을 수 없음`);
  }
}

checkBackups().catch(console.error);
