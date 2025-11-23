#!/usr/bin/env node

/**
 * Setup script to copy Akshara assets to assets folder
 * Run this before building for Akshara brand
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, 'client', 'public', 'Assets - Akshara');
const targetDir = join(__dirname, 'client', 'public', 'assets');

const assets = [
  'Akshara-logo.png',
  'Akshara-headname.png',
  'Akshara-loginbg.jpg',
];

console.log('📦 Setting up Akshara assets...\n');

// Ensure target directory exists
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

// Copy each asset
let copied = 0;
for (const asset of assets) {
  const sourcePath = join(sourceDir, asset);
  const targetPath = join(targetDir, asset);

  if (!existsSync(sourcePath)) {
    console.log(`⚠️  Warning: Source file not found: ${sourcePath}`);
    continue;
  }

  try {
    copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied: ${asset}`);
    copied++;
  } catch (error) {
    console.error(`❌ Error copying ${asset}:`, error.message);
  }
}

if (copied === assets.length) {
  console.log(`\n✅ Successfully copied ${copied} assets to ${targetDir}`);
  console.log('🚀 Assets are ready for build!\n');
} else {
  console.log(`\n⚠️  Warning: Only ${copied} of ${assets.length} assets were copied.\n`);
  process.exit(1);
}

