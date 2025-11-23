#!/usr/bin/env node

/**
 * Cross-platform script to copy environment files
 * Usage: node copy-env.js <source> <destination>
 * Example: node copy-env.js env.akshara.development .env.development
 */

import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const copyEnvFile = (source, dest) => {
  const sourcePath = join(__dirname, source);
  const destPath = join(__dirname, dest);

  if (!existsSync(sourcePath)) {
    console.error(`❌ Error: Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  try {
    copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${source} → ${dest}`);
  } catch (error) {
    console.error(`❌ Error copying file: ${error.message}`);
    process.exit(1);
  }
};

const [source, dest] = process.argv.slice(2);

if (!source || !dest) {
  console.error('Usage: node copy-env.js <source> <destination>');
  console.error('Example: node copy-env.js env.akshara.development .env.development');
  process.exit(1);
}

copyEnvFile(source, dest);

