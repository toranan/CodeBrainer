const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';
const BUCKET_NAME = 'codebrainer-problems';
const PROBLEMS_DIR = path.join(__dirname, '..', 'problems2');

async function uploadFile(filePath, storagePath) {
  const fileContent = fs.readFileSync(filePath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storagePath}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/octet-stream',
    },
    body: fileContent
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function uploadProblem(problemFolder) {
  const problemName = path.basename(problemFolder);
  const files = [];

  // Upload statement.md
  const statementPath = path.join(problemFolder, 'statement.md');
  if (fs.existsSync(statementPath)) {
    files.push({
      local: statementPath,
      remote: `problems/${problemName}/statement.md`
    });
  }

  // Upload test files if tests folder exists
  const testsDir = path.join(problemFolder, 'tests');
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir);
    for (const file of testFiles) {
      if (file.endsWith('.in') || file.endsWith('.out')) {
        files.push({
          local: path.join(testsDir, file),
          remote: `problems/${problemName}/tests/${file}`
        });
      }
    }
  }

  return files;
}

async function main() {
  const problems = fs.readdirSync(PROBLEMS_DIR)
    .filter(name => name.startsWith('problem-'))
    .sort();

  console.log(`Found ${problems.length} problems to upload`);

  let uploaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const problemName of problems) {
    const problemFolder = path.join(PROBLEMS_DIR, problemName);

    if (!fs.statSync(problemFolder).isDirectory()) {
      continue;
    }

    try {
      const files = await uploadProblem(problemFolder);

      for (const file of files) {
        try {
          await uploadFile(file.local, file.remote);
          uploaded++;

          if (uploaded % 50 === 0) {
            console.log(`Progress: ${uploaded} files uploaded`);
          }
        } catch (error) {
          if (error.message.includes('409') || error.message.includes('already exists')) {
            skipped++;
          } else {
            console.error(`Failed to upload ${file.remote}:`, error.message);
            failed++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${problemName}:`, error.message);
      failed++;
    }
  }

  console.log('\n=== Upload Complete ===');
  console.log(`✅ Uploaded: ${uploaded} files`);
  console.log(`⏭️  Skipped: ${skipped} files (already exist)`);
  console.log(`❌ Failed: ${failed} files`);
  console.log(`📁 Total problems processed: ${problems.length}`);
}

main().catch(console.error);
