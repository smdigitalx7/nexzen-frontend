# Dead Code Report - src Directory

## Summary

This report identifies unused code, components, imports, and files in the `client/src` directory.

---

## 🗑️ Completely Unused Files

### 1. **CollectFeeForm.tsx (School)**

- **Location**: `client/src/components/features/school/fees/collect-fee/CollectFeeForm.tsx`
- **Status**: ❌ **DEAD CODE - NOT USED ANYWHERE**
- **Size**: 748 lines
- **Reason**: The school fees collection now uses `MultiplePaymentForm` component directly in `CollectFee.tsx`. This old dialog-based form is never imported or referenced.
- **Action**: **DELETE** - Safe to remove

### 2. **CollectFeeForm.tsx (College)**

- **Location**: `client/src/components/features/college/fees/collect-fee/CollectFeeForm.tsx`
- **Status**: ❌ **DEAD CODE - NOT USED ANYWHERE**
- **Size**: 758 lines
- **Reason**: Similar to school version, college now uses `MultiplePaymentForm` directly.
- **Action**: **DELETE** - Safe to remove

---

## 🧹 Unused Imports

### 1. **School CollectFee.tsx**

**File**: `client/src/components/features/school/fees/collect-fee/CollectFee.tsx`

**Unused Imports:**

- `User` from `lucide-react` (line 5) - ❌ Not used
- `GraduationCap` from `lucide-react` (line 5) - ❌ Not used
- `Calendar` from `lucide-react` (line 5) - ❌ Not used
- `Separator` from `@/components/ui/separator` (line 8) - ❌ Not used

**Action**: Remove these unused imports

### 2. **School CollectFeeForm.tsx**

**File**: `client/src/components/features/school/fees/collect-fee/CollectFeeForm.tsx`

**Unused Imports:**

- `motion` from `framer-motion` (line 2) - ❌ Not used (no motion components in this file)

**Action**: Remove unused import

---

## 📝 Commented Code

### 1. **main.tsx**

**File**: `client/src/main.tsx`

**Commented Code:**

- Lines 8-19: Commented React.forwardRef check
- Lines 49-59: Empty if/else blocks with comments

**Action**: Remove commented code or implement if needed

---

## 🏷️ Deprecated Code

### 1. **Permissions System**

**File**: `client/src/store/auth/permissions.ts`

**Deprecated Exports:**

- `ROLE_PERMISSIONS` - Marked `@deprecated`
- `MODULE_PERMISSIONS` - Marked `@deprecated`
- `canAccessModule()` - Marked `@deprecated`
- `canPerformAction()` - Marked `@deprecated`

**Status**: Still exported but marked deprecated. Check if still in use.

### 2. **Employee Attendance Service**

**File**: `client/src/lib/services/general/employee-attendance.service.ts`

**Deprecated Method:**

- `update()` - Marked `@deprecated`, use `updateIndividual` instead

---

## 🧪 Missing Test Files

**Status**: No test files found in `client/src` directory

- No `*.test.ts` files
- No `*.test.tsx` files
- No `*.spec.ts` files

**Note**: This may be intentional, but worth noting for code coverage.

---

## 📊 Statistics

- **Unused Files**: 2 (1,506 lines total)
- **Unused Imports**: 5 across 2 files
- **Commented Code Blocks**: 2 files
- **Deprecated Code**: 2 files

---

## ✅ Recommended Actions

### High Priority

1. **Delete unused CollectFeeForm files** (both school and college)
   - Saves ~1,500 lines of code
   - Reduces bundle size
   - Eliminates maintenance burden

### Medium Priority

2. **Remove unused imports** from CollectFee.tsx and CollectFeeForm.tsx
   - Cleaner code
   - Slightly smaller bundle

3. **Clean up commented code** in main.tsx
   - Remove or implement the React.forwardRef check
   - Remove empty if/else blocks

### Low Priority

4. **Review deprecated code** usage
   - Check if deprecated permissions are still used
   - Migrate to new permissions system if possible
   - Update deprecated service methods

---

## 🔍 Verification Commands

To verify these findings:

```bash
# Check if CollectFeeForm is imported anywhere
grep -r "CollectFeeForm" client/src --exclude-dir=node_modules

# Check for unused imports (requires ESLint)
npm run lint -- --rule "no-unused-vars: error"

# Find all deprecated code
grep -r "@deprecated" client/src
```

---

## 📅 Last Updated

Generated: $(date)
