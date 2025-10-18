# Quick Rebuild Guide

## The Fixes Applied

### Latest Fix (Issue #3)

The error `Cannot read properties of undefined (reading 'useState')` was caused by **`@tanstack/react-query`** and **`@tanstack/react-table`** being in a separate `data-vendor` chunk. These packages use React hooks and need React to be available.

### Previous Fixes

- **Issue #1:** `createContext` error - Fixed by moving React components to react-vendor
- **Issue #2:** `Cannot access 'r'` error - Fixed by moving `lucide-react` and `recharts` to react-vendor
- **Issue #3:** `useState` error - Fixed by moving `@tanstack` packages to react-vendor

**Final Solution:** ALL React-dependent packages are now in ONE `react-vendor` chunk.

## Rebuild Commands

### Option 1: Quick Rebuild (Recommended)

**For PowerShell (Windows):**

```powershell
# Clean build cache
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Rebuild for production
npm run build
```

**For Bash/Linux/Mac:**

```bash
rm -rf dist node_modules/.vite
npm run build
```

### Option 2: Full Clean Rebuild (If issues persist)

**For PowerShell (Windows):**

```powershell
# Remove everything
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Fresh install and build
npm install
npm run build
```

**For Bash/Linux/Mac:**

```bash
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Option 3: Test Locally First

```bash
# After building
npm run preview

# Then visit http://localhost:4173 to test
```

## What Changed

In `vite.config.ts`, the chunk splitting now includes:

### React Vendor Chunk (loads first as `0-react-vendor-[hash].js`):

- ✅ react, react-dom, scheduler (core)
- ✅ framer-motion (animations)
- ✅ wouter (routing)
- ✅ @radix-ui/\* (all 23+ Radix UI components)
- ✅ react-hook-form, @hookform/\* (forms)
- ✅ lucide-react (icons)
- ✅ recharts (charts)
- ✅ vaul, cmdk, next-themes (UI components)
- ✅ embla-carousel-react (carousel)
- ✅ input-otp, react-day-picker, react-icons (inputs/calendar)
- ✅ react-resizable-panels (layout)
- ✅ **@tanstack/react-query** ⚠️ **CRITICAL FIX - uses React hooks**
- ✅ **@tanstack/react-table** ⚠️ **CRITICAL FIX - uses React hooks**
- ✅ **zustand** (state management with React hooks)

### Utils Vendor Chunk (pure JavaScript only):

- ✅ clsx, tailwind-merge (CSS utilities)
- ✅ date-fns (date manipulation)
- ✅ zod (schema validation)
- ✅ immer (immutable updates)
- ✅ class-variance-authority (CSS utility)
- ✅ tailwindcss-animate (CSS animations)

## Deploy to Production

After building successfully:

```bash
# Commit changes
git add .
git commit -m "Fix: Move all React-dependent packages to react-vendor chunk"
git push origin main
```

## Verify Success

After deployment:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Check Console** - Should have NO errors
4. **Check Network Tab**:
   - Should see `0-react-vendor-[hash].js` load first
   - Should be ~800KB-1.2MB (gzipped ~250-350KB)
   - All other chunks load after it

## Expected Result

✅ No `createContext` errors  
✅ No `Cannot access 'r'` errors  
✅ No favicon 404 errors  
✅ Application loads and works correctly

## If You Still See Errors

1. Check that you cleared browser cache completely
2. Try incognito/private mode
3. Check the Network tab to see which JS file is causing the error
4. Look at the chunk names - `0-react-vendor` should load first
5. Verify all environment variables are set in your hosting platform

## Technical Explanation

The minified variable `r` was likely a reference to React or a React hook. When Vite minifies code, it renames variables to single letters. The error "Cannot access 'r' before initialization" means the code tried to use React before the React module finished initializing.

By putting all React-dependent packages in the same chunk as React, we ensure they can't execute before React is ready.
