# Fix: Environment Variables Not Loading

## The Problem

**Issue**: After hosting, all assets are showing Velonex assets instead of Akshara assets, even though `.env.production` is configured.

## Root Cause

The `vite.config.ts` has:

```typescript
root: path.resolve(__dirname, "client"),
```

When Vite's `root` is set to a subdirectory (like `client`), Vite looks for `.env` files in that root directory, **NOT** in the project root!

So `.env.production` in the project root is **NOT being read** during build.

## The Fix

I've updated `vite.config.ts` to explicitly tell Vite where to find `.env` files:

```typescript
// Explicitly set envDir to project root (not client folder)
// This ensures Vite reads .env.production from the project root
envDir: path.resolve(__dirname),
envPrefix: 'VITE_',
```

This tells Vite to look for `.env.production` in the **project root** (where `package.json` is), not in the `client` folder.

## What Changed

### 1. Updated `vite.config.ts`

Added:

```typescript
envDir: path.resolve(__dirname),  // Points to project root
envPrefix: 'VITE_',               // Only load vars starting with VITE_
```

### 2. Updated Build Scripts

Updated `package.json`:

```json
{
  "build": "vite build --mode production",
  "build:akshara": "node setup-akshara-assets.js && vite build --mode production"
}
```

The `--mode production` flag ensures Vite uses `.env.production` file.

## Deployment Steps (Updated)

### On Your VPS:

```bash
# 1. Clone/Update project
cd /var/www/akshara-erp

# 2. Copy environment file (IMPORTANT: Must be in project root!)
cp env.akshara.production .env.production

# 3. Verify .env.production is in root (same level as package.json)
ls -la .env.production
# Should be in: /var/www/akshara-erp/.env.production ✅

# 4. Setup Akshara assets
npm run setup:akshara

# 5. Build with production mode (IMPORTANT!)
npm run build
# OR
npm run build:akshara
```

### Verify Environment Variables Are Loaded

Before building, you can verify:

```bash
# Check if .env.production exists in root
cat .env.production | grep VITE_BRAND_NAME
# Should show: VITE_BRAND_NAME=Akshara Institute of Maths & Science

# Check if assets are copied
ls -la client/public/assets/Akshara*
# Should show all 3 Akshara assets
```

## Important Points

### ✅ File Locations

```
/project-root/
├── package.json           ✅ Here
├── .env.production        ✅ Must be HERE (not in client folder!)
├── vite.config.ts         ✅ Here
└── client/
    ├── public/
    │   └── assets/
    │       ├── Akshara-logo.png        ✅ After setup
    │       ├── Akshara-headname.png    ✅ After setup
    │       └── Akshara-loginbg.jpg     ✅ After setup
```

### ❌ Wrong Locations

```
/project-root/
├── .env.production        ✅ Correct
└── client/
    ├── .env.production    ❌ WRONG! Vite won't read this anymore
    └── ...
```

## Testing

After building, check the built code:

```bash
# Build
npm run build

# Check if Akshara values are in the build
grep -r "Akshara" dist/ | head -5
# Should show Akshara brand name in the built JS files

# Check if Akshara assets are in dist
ls -la dist/assets/Akshara*
# Should show Akshara assets with hash names
```

## Troubleshooting

### Still showing Velonex assets?

1. **Verify .env.production location:**

   ```bash
   # Must be in project root
   ls -la .env.production
   pwd  # Should be project root, not client folder
   ```

2. **Check file content:**

   ```bash
   cat .env.production | grep VITE_LOGO
   # Should show Akshara paths
   ```

3. **Clean build:**

   ```bash
   rm -rf dist node_modules/.vite
   npm run setup:akshara
   npm run build
   ```

4. **Verify build command uses production mode:**

   ```bash
   npm run build
   # Should run: vite build --mode production
   ```

5. **Check browser console:**
   - Open browser DevTools
   - Check Network tab for asset requests
   - Verify asset paths are `/assets/Akshara-*` not `/assets/nexzen-*`

## Summary

**The fix:**

1. ✅ Added `envDir` to `vite.config.ts` pointing to project root
2. ✅ Updated build commands to use `--mode production`
3. ✅ Ensures `.env.production` is read from project root

**Now:**

- `.env.production` must be in **project root** (same level as `package.json`)
- Build with `npm run build` (uses production mode automatically)
- Assets will be loaded from your configuration!
