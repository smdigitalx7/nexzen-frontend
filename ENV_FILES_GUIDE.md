# Environment Files Guide

## Overview

This project now supports multiple environment files for different brands and environments:

- **Development**: For local testing
- **Production**: For deployment

## Available Environment Files

### Velonex (Default Brand)

1. **`env.velonex.development`** - Development environment for Velonex
2. **`env.velonex.production`** - Production environment for Velonex

### Akshara Institute

1. **`env.akshara.development`** - Development environment for Akshara
2. **`env.akshara.production`** - Production environment for Akshara

## Usage

### Development Mode

#### For Velonex (Default):

```bash
# Option 1: Use the dev script (automatically copies env file)
npm run dev:velonex

# Option 2: Manual setup
node copy-env.js env.velonex.development .env.development
npm run dev
```

#### For Akshara:

```bash
# Option 1: Use the dev script (automatically copies env file and assets)
npm run dev:akshara

# Option 2: Manual setup
node copy-env.js env.akshara.development .env.development
npm run setup:akshara
npm run dev
```

### Production Build

#### For Velonex:

```bash
# Option 1: Use the build script (automatically copies env file)
npm run build:velonex

# Option 2: Manual setup
node copy-env.js env.velonex.production .env.production
npm run build
```

#### For Akshara:

```bash
# Option 1: Use the build script (automatically copies env file and assets)
npm run build:akshara

# Option 2: Manual setup
node copy-env.js env.akshara.production .env.production
npm run setup:akshara
npm run verify:env
npm run build
```

## Quick Reference

### Development Commands

```bash
# Start Velonex development
npm run dev:velonex

# Start Akshara development
npm run dev:akshara
```

### Production Build Commands

```bash
# Build for Velonex
npm run build:velonex

# Build for Akshara
npm run build:akshara
```

## File Structure

```
project-root/
├── .env.development          ← Active dev file (copied from template)
├── .env.production           ← Active prod file (copied from template)
├── env.velonex.development   ← Velonex dev template
├── env.velonex.production    ← Velonex prod template
├── env.akshara.development   ← Akshara dev template
├── env.akshara.production    ← Akshara prod template
└── env.template              ← Base template
```

## Switching Between Brands

### Switch to Akshara (Development):

```bash
# Use the script (recommended - cross-platform)
npm run dev:akshara

# Or manually:
node copy-env.js env.akshara.development .env.development
npm run setup:akshara
npm run dev
```

### Switch to Velonex (Development):

```bash
# Use the script (recommended - cross-platform)
npm run dev:velonex

# Or manually:
node copy-env.js env.velonex.development .env.development
npm run dev
```

### Switch to Akshara (Production):

```bash
# Use the script (recommended - cross-platform)
npm run build:akshara

# Or manually:
node copy-env.js env.akshara.production .env.production
npm run setup:akshara
npm run build
```

### Switch to Velonex (Production):

```bash
# Use the script (recommended - cross-platform)
npm run build:velonex

# Or manually:
node copy-env.js env.velonex.production .env.production
npm run build
```

## Verification

Before building or running dev server, verify your configuration:

```bash
# Check environment file
npm run verify:env

# This will verify:
# - .env.development or .env.production exists
# - All required variables are set
# - Assets are copied (for Akshara)
```

## Important Notes

1. **`.env.development`** is used when running `npm run dev`
2. **`.env.production`** is used when running `npm run build`
3. Always copy from the template files before use
4. The scripts automatically copy the correct template file
5. For Akshara, always run `npm run setup:akshara` first to copy assets

## Troubleshooting

### Environment variables not working in development:

1. Make sure `.env.development` exists in project root
2. Restart the dev server after changing env files
3. Check that variables start with `VITE_`

### Assets not loading in development:

1. For Akshara: Run `npm run setup:akshara`
2. Verify assets exist in `client/public/assets/`
3. Check asset paths in `.env.development`

### Build still using wrong brand:

1. Verify `.env.production` is in project root
2. Check file content: `cat .env.production | grep VITE_BRAND_NAME`
3. Clean build: `rm -rf dist && npm run build`
