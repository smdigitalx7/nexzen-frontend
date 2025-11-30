# Akshara Deployment Steps - VPS

## Important Steps for Deployment

When deploying to VPS, you need to:

1. **Copy Akshara assets** to the assets folder
2. **Copy environment file** to `.env.production`
3. **Build the application**

## Step-by-Step Deployment

### 1. Clone the Project (if not already done)

```bash
cd /var/www
git clone <your-repo-url> akshara-erp
cd akshara-erp
npm install
```

### 2. Copy Environment Configuration

```bash
# Copy the Akshara environment file
cp env.akshara.production .env.production

# Verify the file was copied
cat .env.production | grep VITE_BRAND_NAME
# Should show: VITE_BRAND_NAME=Akshara Institute of Maths & Science
```

### 3. Copy Akshara Assets

**Option A: Using the setup script (Recommended)**

```bash
# Run the setup script
npm run setup:akshara

# Or directly:
node setup-akshara-assets.js
```

**Option B: Manual copy**

```bash
# Make sure assets directory exists
mkdir -p client/public/assets

# Copy Akshara assets
cp "client/public/Assets - Akshara/Akshara-logo.png" client/public/assets/
cp "client/public/Assets - Akshara/Akshara-headname.png" client/public/assets/
cp "client/public/Assets - Akshara/Akshara-loginbg.jpg" client/public/assets/

# Verify files are copied
ls -la client/public/assets/Akshara*
# Should show:
# Akshara-headname.png
# Akshara-loginbg.jpg
# Akshara-logo.png
```

### 4. Verify Assets are in Place

```bash
# Check that all Akshara assets are in the assets folder
ls -la client/public/assets/ | grep Akshara

# Should show:
# Akshara-headname.png
# Akshara-loginbg.jpg
# Akshara-logo.png
```

### 5. Build for Production

**Option A: Using the build script (includes asset setup)**

```bash
npm run build:akshara
```

**Option B: Manual build (after setting up assets)**

```bash
npm run build
```

### 6. Verify Build Output

```bash
# Check if assets are in the dist folder
ls -la dist/assets/ | grep Akshara

# Should show:
# Akshara-headname-[hash].png
# Akshara-loginbg-[hash].jpg
# Akshara-logo-[hash].png
```

### 7. Deploy

Deploy the `dist` folder to your web server (Nginx, Apache, etc.)

## Troubleshooting

### Assets Not Showing After Build

1. **Check if assets were copied before build:**

   ```bash
   ls -la client/public/assets/Akshara*
   ```

   If files are missing, run: `npm run setup:akshara`

2. **Check environment variables:**

   ```bash
   cat .env.production | grep VITE_LOGO
   ```

   Should show paths like `/assets/Akshara-logo.png`

3. **Verify .env.production is in root directory:**

   ```bash
   ls -la .env.production
   ```

   Should be in the project root (same level as package.json)

4. **Clean build and rebuild:**
   ```bash
   rm -rf dist
   npm run setup:akshara
   npm run build
   ```

### Environment Variables Not Working

1. **Make sure .env.production is in the root directory** (not in client folder)

2. **Check file name is exactly `.env.production`** (not `.env.production.txt` or similar)

3. **Verify file has correct format:**

   ```bash
   cat .env.production | head -5
   ```

   Should show environment variables without spaces around `=`

4. **For Vite, environment variables must start with `VITE_`**

### Quick Verification Script

Run this to verify everything is set up correctly:

```bash
#!/bin/bash
echo "Checking Akshara deployment setup..."
echo ""

# Check .env.production
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    if grep -q "Akshara Institute of Maths & Science" .env.production; then
        echo "✅ Brand name configured correctly"
    else
        echo "❌ Brand name not found in .env.production"
    fi
else
    echo "❌ .env.production not found"
fi

# Check assets
echo ""
echo "Checking assets..."
assets_count=$(ls -1 client/public/assets/Akshara* 2>/dev/null | wc -l)
if [ "$assets_count" -eq 3 ]; then
    echo "✅ All 3 Akshara assets found"
    ls -1 client/public/assets/Akshara*
else
    echo "❌ Missing assets (found $assets_count, expected 3)"
    echo "Run: npm run setup:akshara"
fi

echo ""
echo "Done!"
```

## Complete Deployment Command

For a complete fresh deployment on VPS:

```bash
# 1. Clone and install
git clone <repo-url> akshara-erp
cd akshara-erp
npm install

# 2. Setup environment
cp env.akshara.production .env.production

# 3. Setup assets
npm run setup:akshara

# 4. Build
npm run build

# 5. Verify
ls -la dist/assets/ | grep Akshara

# 6. Deploy dist folder to web server
```

## Notes

- The `.env.production` file must be in the **root directory** (same level as `package.json`)
- Assets must be copied to `client/public/assets/` **before** building
- After build, assets will be in `dist/assets/` with hash names
- The build process reads from `.env.production` automatically
- Don't commit `.env.production` to git (it's in .gitignore)
