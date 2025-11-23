# How Environment Variables Work - Complete Flow

## Overview

This document explains how `.env.production` variables are read and used in the application.

## The Flow

```
.env.production (file)
    ↓
Vite Build Process (reads automatically)
    ↓
import.meta.env.VITE_* (available in code)
    ↓
client/src/lib/config/assets.ts (reads env vars)
    ↓
Components import and use assets
```

## Step-by-Step Explanation

### 1. Vite Automatically Reads `.env.production`

**No import needed!** Vite automatically:

- Reads `.env.production` during build time
- Makes variables available via `import.meta.env.VITE_*`
- Only variables starting with `VITE_` are exposed to client code

**Location**: `.env.production` must be in the **root directory** (same level as `package.json`)

```bash
# .env.production (root directory)
VITE_LOGO_SCHOOL=/assets/Akshara-logo.png
VITE_BRAND_NAME=Akshara Institute of Maths & Science
```

### 2. Asset Config Reads Environment Variables

**File**: `client/src/lib/config/assets.ts`

```typescript
// This reads from import.meta.env (provided by Vite)
export const assetConfig = {
  logos: {
    school: getAssetUrl(
      import.meta.env.VITE_LOGO_SCHOOL || "/assets/nexzen-logo.png"
      //     ↑
      //     This reads from .env.production automatically
    ),
    // ... more assets
  },
};
```

**Key Point**: `import.meta.env.VITE_LOGO_SCHOOL` automatically reads from `.env.production` during build.

### 3. Components Import and Use Assets

**File**: `client/src/features/general/pages/Login.tsx`

```typescript
// Import the assets config
import { assets, brand } from "@/lib/config";

// Use in component
<img src={assets.logo('school')} alt="Logo" />
//              ↑
//              This returns the value from .env.production
```

## Complete Example

### `.env.production` (Root Directory)

```bash
VITE_LOGO_SCHOOL=/assets/Akshara-logo.png
VITE_BRAND_NAME=Akshara Institute of Maths & Science
```

### `client/src/lib/config/assets.ts`

```typescript
// Vite makes this available automatically
const logoPath = import.meta.env.VITE_LOGO_SCHOOL;
// Result: "/assets/Akshara-logo.png"

export const assetConfig = {
  logos: {
    school: getAssetUrl(
      import.meta.env.VITE_LOGO_SCHOOL || "/assets/nexzen-logo.png"
    ),
  },
};
```

### Component Usage

```typescript
import { assets } from "@/lib/config";

// In JSX
<img src={assets.logo('school')} />
// This will use: "/assets/Akshara-logo.png" from .env.production
```

## Important Points

### ✅ What Happens Automatically

1. **Vite reads `.env.production`** - No code needed
2. **Variables are available** - Via `import.meta.env.VITE_*`
3. **Build-time replacement** - Values are baked into the build

### ❌ What You DON'T Need to Do

- ❌ No `import` statement for `.env.production`
- ❌ No `require()` or `fs.readFile()`
- ❌ No manual file reading
- ❌ No runtime file reading

### ✅ What You DO Need to Do

1. **Create `.env.production`** in root directory
2. **Use `VITE_` prefix** for all variables
3. **Import the config** in components: `import { assets } from '@/lib/config'`

## Build Process

When you run `npm run build`:

1. **Vite reads `.env.production`**

   ```bash
   VITE_LOGO_SCHOOL=/assets/Akshara-logo.png
   ```

2. **Makes it available as `import.meta.env.VITE_LOGO_SCHOOL`**

3. **Asset config reads it:**

   ```typescript
   import.meta.env.VITE_LOGO_SCHOOL; // "/assets/Akshara-logo.png"
   ```

4. **Value is baked into the build** (not read at runtime)

5. **Components use the value:**
   ```typescript
   assets.logo("school"); // Returns "/assets/Akshara-logo.png"
   ```

## Verification

To verify environment variables are being read:

### 1. Check Build Output

```bash
# Build the project
npm run build

# Check if values are in the built code
grep -r "Akshara-logo" dist/
```

### 2. Add Debug Log (Temporary)

```typescript
// In assets.ts (temporary, remove after testing)
console.log("Logo path:", import.meta.env.VITE_LOGO_SCHOOL);
```

### 3. Check Browser Console

After build, the values should be in the JavaScript bundle.

## Common Issues

### Issue: Variables Not Working

**Problem**: `.env.production` not in root directory

**Solution**:

```bash
# Must be here:
/project-root/.env.production  ✅

# NOT here:
/project-root/client/.env.production  ❌
```

### Issue: Variables Not Prefixed with VITE\_

**Problem**: Variable name doesn't start with `VITE_`

**Solution**:

```bash
# Wrong:
LOGO_SCHOOL=/assets/logo.png  ❌

# Correct:
VITE_LOGO_SCHOOL=/assets/logo.png  ✅
```

### Issue: Need to Rebuild After Changing .env

**Problem**: Changes to `.env.production` require rebuild

**Solution**:

```bash
# After changing .env.production
npm run build
```

## Summary

**The magic happens automatically:**

1. ✅ Vite reads `.env.production` during build
2. ✅ Makes variables available via `import.meta.env.VITE_*`
3. ✅ Asset config reads them: `import.meta.env.VITE_LOGO_SCHOOL`
4. ✅ Components import config: `import { assets } from '@/lib/config'`
5. ✅ Use in code: `assets.logo('school')`

**No manual file reading needed!** Vite handles everything automatically.
