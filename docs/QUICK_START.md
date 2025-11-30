# Quick Start Guide - Environment Setup

## 🚀 Quick Commands

### Development (Local Testing)

```bash
# Test Velonex locally
npm run dev:velonex

# Test Akshara locally  
npm run dev:akshara
```

### Production Build

```bash
# Build for Velonex
npm run build:velonex

# Build for Akshara
npm run build:akshara
```

## 📁 Environment Files Created

### ✅ Velonex (Default Brand)
- **`env.velonex.development`** - For local testing
- **`env.velonex.production`** - For production deployment

### ✅ Akshara Institute
- **`env.akshara.development`** - For local testing
- **`env.akshara.production`** - For production deployment (already existed)

## 🎯 How It Works

### Development Mode

When you run `npm run dev:velonex` or `npm run dev:akshara`:

1. ✅ Automatically copies the correct `.env.development` file
2. ✅ For Akshara: Copies assets to `client/public/assets/`
3. ✅ Starts Vite dev server with the correct configuration

### Production Build

When you run `npm run build:velonex` or `npm run build:akshara`:

1. ✅ Automatically copies the correct `.env.production` file
2. ✅ For Akshara: Copies assets and verifies configuration
3. ✅ Builds with production optimizations

## 📝 Testing Locally

### Test Velonex:

```bash
npm run dev:velonex
```

Open: `http://localhost:7000`

You should see:
- ✅ Velonex branding
- ✅ Velonex logos
- ✅ Velonex assets

### Test Akshara:

```bash
npm run dev:akshara
```

Open: `http://localhost:7000`

You should see:
- ✅ Akshara branding
- ✅ Akshara logos  
- ✅ Akshara assets

## 🔄 Switching Between Brands

### While Testing Locally:

```bash
# Switch to Velonex
npm run dev:velonex

# Switch to Akshara
npm run dev:akshara
```

**Note:** Make sure to stop the dev server (`Ctrl+C`) before switching!

## ✅ Verification

After running dev or build commands, verify:

1. **Check browser** - Assets and branding should match the brand
2. **Check console** - No errors related to missing assets
3. **Check network tab** - Asset requests should succeed

## 🐛 Troubleshooting

### Assets not showing?

```bash
# For Akshara, make sure assets are copied
npm run setup:akshara

# Then restart dev server
npm run dev:akshara
```

### Wrong brand showing?

1. Stop the dev server (`Ctrl+C`)
2. Delete `.env.development` or `.env.production`
3. Run the correct script again

### Environment variables not working?

1. Check that `.env.development` (or `.env.production`) exists in project root
2. Verify it's the correct file for the brand you're testing
3. Restart the dev server after copying env files

## 📚 More Information

See `ENV_FILES_GUIDE.md` for detailed information about environment files and configuration.

