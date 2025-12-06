#!/usr/bin/env node

/**
 * UI Freeze Issues Static Analysis Script
 * 
 * This script performs static analysis to find potential UI freeze causes:
 * - Heavy synchronous loops
 * - Missing cleanup for intervals/timeouts
 * - Missing cleanup for event listeners
 * - Problematic useEffect patterns
 * - DOM modifications that might block
 * 
 * Usage: node check-ui-freeze-issues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runRipgrep(pattern, options = {}) {
  const { exclude, fileTypes = ['tsx', 'ts'], context = 0 } = options;
  
  try {
    let cmd = `rg -n "${pattern}"`;
    
    // Add file type filters
    if (fileTypes.length > 0) {
      fileTypes.forEach(type => {
        cmd += ` --type ${type}`;
      });
    }
    
    // Add context lines
    if (context > 0) {
      cmd += ` -C ${context}`;
    }
    
    // Exclude pattern
    if (exclude) {
      cmd += ` | rg -v "${exclude}"`;
    }
    
    // Exclude node_modules and common ignore patterns
    cmd += ` -g '!node_modules/**' -g '!*.min.js' -g '!*.d.ts'`;
    
    const result = execSync(cmd, { 
      encoding: 'utf-8', 
      stdio: 'pipe',
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    return result.trim().split('\n').filter(l => l.length > 0);
  } catch (e) {
    // ripgrep returns non-zero exit code when no matches found
    if (e.status === 1) {
      return [];
    }
    throw e;
  }
}

function analyzeHeavyLoops() {
  log('\n1. 🔄 Heavy Synchronous Loops', 'cyan');
  log('   Checking for forEach/map/for loops that might block UI...', 'yellow');
  
  const patterns = [
    { name: 'forEach loops', pattern: '\\.forEach\\s*\\(' },
    { name: 'map operations', pattern: '\\.map\\s*\\(' },
    { name: 'for loops', pattern: 'for\\s*\\([^)]*\\)\\s*\\{' },
  ];
  
  const results = [];
  patterns.forEach(({ name, pattern }) => {
    const matches = runRipgrep(pattern, { fileTypes: ['tsx', 'ts'] });
    results.push({ name, count: matches.length, matches: matches.slice(0, 10) });
  });
  
  results.forEach(({ name, count, matches }) => {
    log(`   ${name}: ${count} matches`, count > 50 ? 'red' : 'green');
    if (matches.length > 0 && count > 20) {
      log(`   ⚠️  Sample matches (first 3):`, 'yellow');
      matches.slice(0, 3).forEach(m => log(`      ${m}`, 'yellow'));
    }
  });
  
  return results;
}

function analyzeMissingCleanup() {
  log('\n2. 🧹 Missing Cleanup (setInterval/setTimeout)', 'cyan');
  log('   Checking for intervals/timeouts without cleanup...', 'yellow');
  
  const setIntervalMatches = runRipgrep('setInterval', { fileTypes: ['tsx', 'ts'] });
  const clearIntervalMatches = runRipgrep('clearInterval', { fileTypes: ['tsx', 'ts'] });
  const setTimeoutMatches = runRipgrep('setTimeout', { fileTypes: ['tsx', 'ts'] });
  const clearTimeoutMatches = runRipgrep('clearTimeout', { fileTypes: ['tsx', 'ts'] });
  
  const intervalRatio = setIntervalMatches.length / Math.max(clearIntervalMatches.length, 1);
  const timeoutRatio = setTimeoutMatches.length / Math.max(clearTimeoutMatches.length, 1);
  
  log(`   setInterval: ${setIntervalMatches.length} uses, ${clearIntervalMatches.length} cleanups`, 
    intervalRatio > 1.2 ? 'red' : 'green');
  log(`   setTimeout: ${setTimeoutMatches.length} uses, ${clearTimeoutMatches.length} cleanups`, 
    timeoutRatio > 1.5 ? 'red' : 'green');
  
  if (intervalRatio > 1.2) {
    log('   ⚠️  Potential missing clearInterval cleanup!', 'red');
    setIntervalMatches.slice(0, 5).forEach(m => {
      if (!m.includes('clearInterval')) {
        log(`      ${m}`, 'yellow');
      }
    });
  }
  
  return { intervalRatio, timeoutRatio };
}

function analyzeEventListeners() {
  log('\n3. 👂 Event Listener Cleanup', 'cyan');
  log('   Checking for addEventListener without removeEventListener...', 'yellow');
  
  const addMatches = runRipgrep('addEventListener', { fileTypes: ['tsx', 'ts'] });
  const removeMatches = runRipgrep('removeEventListener', { fileTypes: ['tsx', 'ts'] });
  
  const ratio = addMatches.length / Math.max(removeMatches.length, 1);
  
  log(`   addEventListener: ${addMatches.length} uses`, 'blue');
  log(`   removeEventListener: ${removeMatches.length} uses`, 'blue');
  log(`   Ratio: ${ratio.toFixed(2)}`, ratio > 1.3 ? 'red' : 'green');
  
  if (ratio > 1.3) {
    log('   ⚠️  Potential missing removeEventListener cleanup!', 'red');
  }
  
  return { ratio, addMatches: addMatches.length, removeMatches: removeMatches.length };
}

function analyzeUseEffectPatterns() {
  log('\n4. ⚛️  useEffect Patterns (Potential Infinite Loops)', 'cyan');
  log('   Checking for useEffect with setState patterns...', 'yellow');
  
  // This is a heuristic - actual analysis requires context
  const useEffectMatches = runRipgrep('useEffect', { fileTypes: ['tsx'] });
  const setStateInEffect = runRipgrep('useEffect', { 
    fileTypes: ['tsx'], 
    context: 10 
  }).filter(m => {
    const lines = m.split('\n');
    const hasUseEffect = lines.some(l => l.includes('useEffect'));
    const hasSetState = lines.some(l => /set[A-Z]\w*\(/.test(l));
    return hasUseEffect && hasSetState;
  });
  
  log(`   Total useEffect hooks: ${useEffectMatches.length}`, 'blue');
  log(`   useEffect with setState: ${setStateInEffect.length}`, 
    setStateInEffect.length > 20 ? 'yellow' : 'green');
  
  if (setStateInEffect.length > 20) {
    log('   ⚠️  Many useEffect hooks with setState - manual review recommended', 'yellow');
  }
  
  return { total: useEffectMatches.length, withSetState: setStateInEffect.length };
}

function analyzeDOMModifications() {
  log('\n5. 🎨 DOM Modifications (Potential Blocking)', 'cyan');
  log('   Checking for direct DOM style modifications...', 'yellow');
  
  const bodyStyleMatches = runRipgrep('document\\.body\\.style', { fileTypes: ['tsx', 'ts'] });
  const overflowMatches = runRipgrep('overflow.*hidden', { fileTypes: ['tsx', 'ts'] });
  
  log(`   document.body.style modifications: ${bodyStyleMatches.length}`, 
    bodyStyleMatches.length > 10 ? 'yellow' : 'green');
  log(`   overflow: hidden usage: ${overflowMatches.length}`, 
    overflowMatches.length > 5 ? 'yellow' : 'green');
  
  if (bodyStyleMatches.length > 10) {
    log('   ⚠️  Multiple body style modifications - verify cleanup', 'yellow');
    bodyStyleMatches.slice(0, 5).forEach(m => log(`      ${m}`, 'yellow'));
  }
  
  return { bodyStyle: bodyStyleMatches.length, overflow: overflowMatches.length };
}

function analyzeAsyncOperations() {
  log('\n6. ⏱️  Async Operations (Nested Delays)', 'cyan');
  log('   Checking for nested requestAnimationFrame/setTimeout...', 'yellow');
  
  const rafMatches = runRipgrep('requestAnimationFrame', { fileTypes: ['tsx', 'ts'] });
  const ricMatches = runRipgrep('requestIdleCallback', { fileTypes: ['tsx', 'ts'] });
  
  // Check for nested patterns (heuristic)
  const nestedPatterns = runRipgrep('requestAnimationFrame.*setTimeout|setTimeout.*requestAnimationFrame', {
    fileTypes: ['tsx', 'ts'],
    context: 5
  });
  
  log(`   requestAnimationFrame: ${rafMatches.length} uses`, 'blue');
  log(`   requestIdleCallback: ${ricMatches.length} uses`, 'blue');
  log(`   Nested patterns: ${nestedPatterns.length}`, 
    nestedPatterns.length > 5 ? 'red' : 'green');
  
  if (nestedPatterns.length > 5) {
    log('   ⚠️  Multiple nested async operations - potential delay cascade!', 'red');
    nestedPatterns.slice(0, 3).forEach(m => log(`      ${m.split('\n')[0]}`, 'yellow'));
  }
  
  return { raf: rafMatches.length, ric: ricMatches.length, nested: nestedPatterns.length };
}

function analyzeJSONParsing() {
  log('\n7. 📦 JSON Parsing in Loops', 'cyan');
  log('   Checking for JSON.parse in loops...', 'yellow');
  
  const jsonParseMatches = runRipgrep('JSON\\.parse', { 
    fileTypes: ['tsx', 'ts'],
    context: 3
  });
  
  // Heuristic: check if JSON.parse is near forEach/for
  const inLoops = jsonParseMatches.filter(m => {
    const lines = m.toLowerCase();
    return lines.includes('foreach') || lines.includes('for(') || lines.includes('.map(');
  });
  
  log(`   JSON.parse usage: ${jsonParseMatches.length}`, 'blue');
  log(`   JSON.parse in loops: ${inLoops.length}`, 
    inLoops.length > 3 ? 'red' : 'green');
  
  if (inLoops.length > 3) {
    log('   ⚠️  JSON.parse in loops can block UI!', 'red');
    inLoops.slice(0, 3).forEach(m => log(`      ${m.split('\n')[0]}`, 'yellow'));
  }
  
  return { total: jsonParseMatches.length, inLoops: inLoops.length };
}

function generateSummary(results) {
  log('\n' + '='.repeat(50), 'bright');
  log('📊 SUMMARY', 'bright');
  log('='.repeat(50), 'bright');
  
  const issues = [];
  
  if (results.loops.some(r => r.count > 50)) {
    issues.push('Heavy loops detected');
  }
  
  if (results.cleanup.intervalRatio > 1.2 || results.cleanup.timeoutRatio > 1.5) {
    issues.push('Missing cleanup for intervals/timeouts');
  }
  
  if (results.listeners.ratio > 1.3) {
    issues.push('Missing event listener cleanup');
  }
  
  if (results.dom.bodyStyle > 10) {
    issues.push('Multiple DOM modifications');
  }
  
  if (results.async.nested > 5) {
    issues.push('Nested async operations');
  }
  
  if (results.json.inLoops > 3) {
    issues.push('JSON parsing in loops');
  }
  
  if (issues.length === 0) {
    log('✅ No critical issues detected!', 'green');
  } else {
    log(`⚠️  ${issues.length} potential issue(s) found:`, 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
  }
  
  log('\n💡 Next Steps:', 'cyan');
  log('   1. Review high-priority findings in docs/UI_FREEZE_COMPREHENSIVE_AUDIT.md', 'blue');
  log('   2. Test fixes in development environment', 'blue');
  log('   3. Monitor performance in production', 'blue');
}

// Main execution
function main() {
  log('🔍 UI Freeze Issues - Static Analysis', 'bright');
  log('='.repeat(50), 'bright');
  log('Scanning codebase for potential UI freeze causes...\n', 'yellow');
  
  try {
    const results = {
      loops: analyzeHeavyLoops(),
      cleanup: analyzeMissingCleanup(),
      listeners: analyzeEventListeners(),
      useEffect: analyzeUseEffectPatterns(),
      dom: analyzeDOMModifications(),
      async: analyzeAsyncOperations(),
      json: analyzeJSONParsing(),
    };
    
    generateSummary(results);
    
    log('\n✅ Analysis complete!', 'green');
  } catch (error) {
    log(`\n❌ Error during analysis: ${error.message}`, 'red');
    log('Make sure ripgrep (rg) is installed: https://github.com/BurntSushi/ripgrep', 'yellow');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, analyzeHeavyLoops, analyzeMissingCleanup };





















