# 🚨 UI Freeze Issues - Quick Reference

## Top 5 Critical Issues to Fix First

### 1. ⚠️ Excel Export Blocks UI
**File:** `client/src/common/utils/export/excel-export-utils.ts:324-426`  
**Fix:** Add chunking with `requestIdleCallback`  
**Impact:** Blocks UI for 1-2s with 2000+ rows

### 2. ⚠️ Missing setInterval Cleanup
**File:** `client/src/common/hooks/useTokenManagement.ts:95-97`  
**Fix:** Ensure cleanup always runs  
**Impact:** Memory leak, unexpected behavior

### 3. ⚠️ Event Listener Leak
**File:** `client/src/common/hooks/useIdleTimeout.ts:103-115`  
**Fix:** Store handler reference, cleanup properly  
**Impact:** Memory leak, duplicate listeners

### 4. ⚠️ Body Overflow Not Restored
**File:** `client/src/common/components/shared/ReceiptPreviewModal.tsx:88-115`  
**Fix:** Restore in close handler (already done, verify)  
**Impact:** Page becomes unscrollable

### 5. ⚠️ Nested Async Operations
**File:** `client/src/features/*/reservations/ReservationManagement.tsx`  
**Fix:** Use `startTransition` for non-urgent updates  
**Impact:** 300-500ms delay cascade

---

## Quick Commands

### Run Analysis
```bash
node check-ui-freeze-issues.js
```

### Check Specific Pattern
```bash
# Find all setInterval without clearInterval
rg "setInterval" --type tsx | rg -v "clearInterval"

# Find all addEventListener without removeEventListener  
rg "addEventListener" --type tsx | rg -v "removeEventListener"

# Find heavy forEach loops
rg "\.forEach\s*\(" --type tsx -A 5
```

### Test UI Responsiveness
1. Open Chrome DevTools → Performance
2. Record while performing action
3. Check for long tasks (>50ms)
4. Look for "Main Thread" blocking

---

## Common Patterns to Avoid

### ❌ Bad: Synchronous Heavy Loop
```typescript
data.forEach(item => {
  // Heavy synchronous operation
  processItem(item);
});
```

### ✅ Good: Chunked Processing
```typescript
async function processChunked(data) {
  const CHUNK = 50;
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.slice(i, i + CHUNK);
    chunk.forEach(processItem);
    
    if (i + CHUNK < data.length) {
      await new Promise(r => requestIdleCallback(r, { timeout: 100 }));
    }
  }
}
```

### ❌ Bad: Missing Cleanup
```typescript
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  // Missing return cleanup!
}, []);
```

### ✅ Good: Always Cleanup
```typescript
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  return () => clearInterval(interval);
}, []);
```

### ❌ Bad: Nested Async Delays
```typescript
requestAnimationFrame(() => {
  setTimeout(() => {
    requestIdleCallback(() => {
      // Operation
    });
  }, 200);
});
```

### ✅ Good: Single Delay with startTransition
```typescript
import { startTransition } from 'react';

startTransition(() => {
  setTimeout(() => {
    // Operation
  }, 100);
});
```

---

## Testing Checklist

- [ ] Export 2000+ rows → UI remains responsive
- [ ] Close modal rapidly 10x → No event listener leaks
- [ ] Navigate away with modal open → Body scroll works
- [ ] Rapid clicks on action buttons → Debounced properly
- [ ] Large JSON response → Parsed without blocking

---

## Full Report

See `docs/UI_FREEZE_COMPREHENSIVE_AUDIT.md` for complete analysis.

















