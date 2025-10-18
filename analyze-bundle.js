#!/usr/bin/env node

/**
 * Bundle analysis script
 * Analyzes the built bundle and provides optimization recommendations
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const analyzeBundle = async () => {
  const distPath = join(__dirname, 'dist');
  
  if (!existsSync(distPath)) {
    console.log('❌ No dist folder found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('📊 Bundle Analysis Report');
  console.log('========================\n');

  // Analyze JavaScript files
  const jsFiles = [];
  const cssFiles = [];
  let totalSize = 0;

  try {
    const fs = await import('fs');
    const files = fs.readdirSync(distPath, { recursive: true });
    
    files.forEach(file => {
      const filePath = join(distPath, file);
      const stats = fs.statSync(filePath);
      
      if (file.endsWith('.js')) {
        jsFiles.push({ name: file, size: stats.size });
        totalSize += stats.size;
      } else if (file.endsWith('.css')) {
        cssFiles.push({ name: file, size: stats.size });
        totalSize += stats.size;
      }
    });

    // Sort by size
    jsFiles.sort((a, b) => b.size - a.size);
    cssFiles.sort((a, b) => b.size - a.size);

    console.log('📦 JavaScript Files:');
    jsFiles.forEach(file => {
      const sizeKB = (file.size / 1024).toFixed(2);
      const status = file.size > 500000 ? '🔴' : file.size > 200000 ? '🟡' : '🟢';
      console.log(`  ${status} ${file.name}: ${sizeKB} KB`);
    });

    console.log('\n🎨 CSS Files:');
    cssFiles.forEach(file => {
      const sizeKB = (file.size / 1024).toFixed(2);
      const status = file.size > 100000 ? '🔴' : file.size > 50000 ? '🟡' : '🟢';
      console.log(`  ${status} ${file.name}: ${sizeKB} KB`);
    });

    console.log('\n📈 Summary:');
    console.log(`  Total Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  JavaScript Files: ${jsFiles.length}`);
    console.log(`  CSS Files: ${cssFiles.length}`);

    // Recommendations
    console.log('\n💡 Optimization Recommendations:');
    
    const largeJsFiles = jsFiles.filter(f => f.size > 500000);
    if (largeJsFiles.length > 0) {
      console.log('  🔴 Large JavaScript files detected:');
      largeJsFiles.forEach(file => {
        console.log(`     - ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
      console.log('     Consider code splitting or lazy loading for these files.');
    }

    const largeCssFiles = cssFiles.filter(f => f.size > 100000);
    if (largeCssFiles.length > 0) {
      console.log('  🔴 Large CSS files detected:');
      largeCssFiles.forEach(file => {
        console.log(`     - ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
      console.log('     Consider purging unused CSS or splitting stylesheets.');
    }

    if (jsFiles.length > 10) {
      console.log('  🟡 Many JavaScript chunks detected:');
      console.log(`     - ${jsFiles.length} files`);
      console.log('     Consider consolidating smaller chunks to reduce HTTP requests.');
    }

    if (totalSize > 2 * 1024 * 1024) { // 2MB
      console.log('  🔴 Total bundle size is large:');
      console.log(`     - ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('     Consider implementing more aggressive code splitting.');
    } else if (totalSize > 1 * 1024 * 1024) { // 1MB
      console.log('  🟡 Total bundle size is moderate:');
      console.log(`     - ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('     Consider further optimization for better performance.');
    } else {
      console.log('  🟢 Bundle size is well optimized!');
    }

    console.log('\n✅ Analysis complete!');
    console.log('   Run "npm run build:analyze" for detailed visual analysis.');

  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
};

analyzeBundle().catch(console.error);
