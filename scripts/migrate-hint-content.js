const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';
const BUCKET_NAME = 'codebrainer-problems';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchStorageContent(path) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      console.error(`  ❌ Failed to fetch ${path}:`, error.message);
      return null;
    }

    const text = await data.text();
    return text;
  } catch (error) {
    console.error(`  ❌ Error fetching ${path}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Checking hint table for path-based content...\n');

  // Query hints that have paths (not full content)
  const { data: hints, error } = await supabase
    .from('problem_hints')
    .select('id, problem_id, stage, title, content_md, wait_seconds')
    .order('problem_id', { ascending: true })
    .order('stage', { ascending: true });

  if (error) {
    console.error('❌ Failed to query hints:', error);
    return;
  }

  console.log(`✅ Found ${hints.length} hints in total\n`);

  // Filter hints that look like paths (e.g., "problems/xxx/hints/hint1.md")
  const pathHints = hints.filter(hint => {
    const content = hint.content_md || '';
    return content.startsWith('problems/') && content.includes('.md');
  });

  console.log(`📝 Found ${pathHints.length} hints with file paths\n`);

  if (pathHints.length === 0) {
    console.log('✅ No hints need migration - all hints already have content!');
    return;
  }

  console.log('Sample hints with paths:');
  pathHints.slice(0, 3).forEach(hint => {
    console.log(`  - Hint ${hint.id}: problem=${hint.problem_id}, stage=${hint.stage}, path=${hint.content_md}`);
  });

  console.log('\n📥 Starting migration...\n');

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < pathHints.length; i++) {
    const hint = pathHints[i];
    const path = hint.content_md;

    console.log(`[${i + 1}/${pathHints.length}] Processing hint ${hint.id} (problem=${hint.problem_id}, stage=${hint.stage})`);
    console.log(`  Path: ${path}`);

    // Fetch content from storage
    const content = await fetchStorageContent(path);

    if (!content) {
      console.log(`  ⚠️  Skipping - file not found or empty\n`);
      skipCount++;
      continue;
    }

    console.log(`  ✅ Fetched ${content.length} characters`);

    // Update the hint with actual content
    const { error: updateError } = await supabase
      .from('problem_hints')
      .update({ content_md: content })
      .eq('id', hint.id);

    if (updateError) {
      console.log(`  ❌ Failed to update: ${updateError.message}\n`);
      failCount++;
      continue;
    }

    console.log(`  ✅ Updated successfully\n`);
    successCount++;

    // Add a small delay to avoid rate limiting
    if (i > 0 && i % 10 === 0) {
      console.log('  ⏸️  Pausing for 1 second...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`📊 Total: ${pathHints.length}`);
}

main().catch(console.error);
