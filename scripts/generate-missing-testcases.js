const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const PROBLEMS_DIR = path.join(__dirname, '..', 'problems');

// Markdown에서 예제 입출력 추출
function extractExamples(markdownContent) {
  const examples = [];

  // **입력**과 **출력** 패턴 찾기
  const examplePattern = /\*\*입력\*\*\s*```[\s\S]*?\n([\s\S]*?)```[\s\S]*?\*\*출력\*\*\s*```[\s\S]*?\n([\s\S]*?)```/gi;

  let match;
  while ((match = examplePattern.exec(markdownContent)) !== null) {
    const input = match[1].trim();
    const output = match[2].trim();

    if (input && output) {
      examples.push({ input, output });
    }
  }

  return examples;
}

async function main() {
  console.log('🔍 부족한 테스트케이스 5개로 채우기\n');

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

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];

    console.log(`[${i + 1}/${problems.length}] ${problem.slug} (ID: ${problem.id})`);

    // 2. 현재 테스트케이스 개수 확인
    const { data: existingTests } = await supabase
      .from('problem_tests')
      .select('case_no')
      .eq('problem_id', problem.id)
      .order('case_no');

    const currentCount = existingTests?.length || 0;
    console.log(`   현재: ${currentCount}개`);

    if (currentCount >= 5) {
      console.log(`   ✅ 이미 5개 이상\n`);
      successCount++;
      continue;
    }

    const needed = 5 - currentCount;
    console.log(`   📝 ${needed}개 필요`);

    // 3. 로컬 problems2 폴더에서 markdown 파일 읽기
    const problemDir = path.join(PROBLEMS_DIR, problem.slug);

    if (!fs.existsSync(problemDir)) {
      console.log(`   ❌ 로컬 폴더 없음: ${problemDir}\n`);
      failCount++;
      continue;
    }

    // description.md 또는 statement.md 찾기
    let mdContent = '';
    const mdFiles = ['description.md', 'statement.md', 'problem.md'];

    for (const mdFile of mdFiles) {
      const mdPath = path.join(problemDir, mdFile);
      if (fs.existsSync(mdPath)) {
        mdContent = fs.readFileSync(mdPath, 'utf-8');
        console.log(`   📄 읽음: ${mdFile}`);
        break;
      }
    }

    if (!mdContent) {
      console.log(`   ⚠️  Markdown 파일 없음\n`);
      failCount++;
      continue;
    }

    // 4. 예제 추출
    const examples = extractExamples(mdContent);
    console.log(`   📋 예제 ${examples.length}개 발견`);

    if (examples.length === 0) {
      console.log(`   ⚠️  예제를 찾을 수 없음\n`);
      failCount++;
      continue;
    }

    // 5. 예제 형식 분석
    const sampleExample = examples[0];
    console.log(`   🔍 예제 형식:`);
    console.log(`      입력: ${sampleExample.input.substring(0, 50)}...`);
    console.log(`      출력: ${sampleExample.output.substring(0, 50)}...`);

    // 6. 부족한 테스트케이스 생성
    const existingNums = new Set((existingTests || []).map(t => t.case_no));
    let addedCount = 0;

    // tests 폴더 생성
    const testsDir = path.join(problemDir, 'tests');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    for (let testNum = 1; testNum <= 5; testNum++) {
      if (existingNums.has(testNum)) {
        console.log(`      ⏭️  ${testNum}번 이미 존재`);
        continue;
      }

      // 예제를 순환하며 사용
      const exampleIndex = (testNum - 1) % examples.length;
      const example = examples[exampleIndex];

      // 로컬에 파일 생성
      const inputPath = path.join(testsDir, `${testNum}.in`);
      const outputPath = path.join(testsDir, `${testNum}.out`);

      fs.writeFileSync(inputPath, example.input);
      fs.writeFileSync(outputPath, example.output);

      console.log(`      ✅ 로컬 파일 생성: ${testNum}.in, ${testNum}.out`);

      // 스토리지에 업로드
      const inputBuffer = Buffer.from(example.input, 'utf-8');
      const outputBuffer = Buffer.from(example.output, 'utf-8');

      const { error: uploadInputError } = await supabase
        .storage
        .from('codebrainer-problems')
        .upload(`problems/${problem.slug}/tests/${testNum}.in`, inputBuffer, {
          contentType: 'text/plain',
          upsert: true
        });

      const { error: uploadOutputError } = await supabase
        .storage
        .from('codebrainer-problems')
        .upload(`problems/${problem.slug}/tests/${testNum}.out`, outputBuffer, {
          contentType: 'text/plain',
          upsert: true
        });

      if (uploadInputError || uploadOutputError) {
        console.log(`      ❌ 업로드 실패: ${uploadInputError?.message || uploadOutputError?.message}`);
        continue;
      }

      console.log(`      ✅ 스토리지 업로드: ${testNum}.in, ${testNum}.out`);

      // DB에 경로 추가
      const { error: insertError } = await supabase
        .from('problem_tests')
        .insert({
          problem_id: problem.id,
          case_no: testNum,
          in_path: `problems/${problem.slug}/tests/${testNum}.in`,
          out_path: `problems/${problem.slug}/tests/${testNum}.out`,
          is_hidden: testNum > 2
        });

      if (insertError) {
        console.log(`      ❌ DB 삽입 실패: ${insertError.message}`);
      } else {
        console.log(`      ✅ DB 삽입 완료`);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(`   ✅ ${addedCount}개 테스트케이스 추가 성공\n`);
      successCount++;
    } else {
      console.log(`   ❌ 추가 실패\n`);
      failCount++;
    }

    // Rate limit 방지
    if ((i + 1) % 3 === 0) {
      console.log('   ⏸️  잠시 대기...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('테스트케이스 생성 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📊 전체: ${problems.length}개`);
  console.log('='.repeat(60));
}

main().catch(console.error);
