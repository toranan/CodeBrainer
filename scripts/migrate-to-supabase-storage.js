#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'codebrainer-problems';
const LOCAL_STORAGE_PATH = path.join(__dirname, '../backend/orchestrator/storage');

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

async function uploadFile(localPath, remotePath) {
  const fileContent = await fs.readFile(localPath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${remotePath}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: fileContent,
  });

  if (!response.ok && response.status !== 409) { // 409 = already exists
    throw new Error(`Failed to upload ${remotePath}: ${response.statusText}`);
  }

  console.log(`✓ Uploaded: ${remotePath}`);
}

async function walkDirectory(dirPath, baseDir = dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(fullPath, baseDir);
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath);
      const remotePath = relativePath.replace(/\\/g, '/');
      await uploadFile(fullPath, remotePath);
    }
  }
}

async function main() {
  console.log('Uploading files to Supabase Storage...\n');

  const problemsPath = path.join(LOCAL_STORAGE_PATH, 'problems');
  await walkDirectory(problemsPath, LOCAL_STORAGE_PATH);

  console.log('\n✓ Migration completed!');
  console.log('\nSet these environment variables to use Supabase Storage:');
  console.log('  STORAGE_TYPE=supabase');
  console.log('  SUPABASE_URL=https://sqwobsmtrgjuhgymfwtl.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-key');
}

main().catch(console.error);
