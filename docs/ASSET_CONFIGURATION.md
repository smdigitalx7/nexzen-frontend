# Asset Configuration Guide

## Overview

This document explains how to configure logos, backgrounds, and other images for production deployments. All assets are now configurable via environment variables, allowing for easy customization without code changes.

## Features

- ✅ **Environment Variable Configuration** - Configure all assets via environment variables
- ✅ **CDN Support** - Support for hosting assets on CDN with base URL
- ✅ **Relative Path Support** - Works with relative paths for local deployment
- ✅ **Full URL Support** - Support for absolute URLs
- ✅ **Branch Type Based** - Automatic logo selection based on branch type (SCHOOL/COLLEGE)
- ✅ **Type Safe** - Full TypeScript support

## Configuration

### Environment Variables

All asset configuration is done through environment variables. Copy `env.template` to `.env` and configure the following variables:

#### Asset Base Configuration

```bash
# Base URL for assets (optional - use if assets are hosted on CDN)
# Example: https://cdn.example.com
# Leave empty to use relative paths
VITE_ASSETS_BASE_URL=

# Asset path prefix (default: /assets)
VITE_ASSETS_PATH=/assets
```

#### Logo Configuration

```bash
# School logo - can be relative path or full URL
VITE_LOGO_SCHOOL=/assets/nexzen-logo.png

# College logo - can be relative path or full URL
VITE_LOGO_COLLEGE=/assets/Velocity-logo.png

# Brand/Headname logo - can be relative path or full URL
VITE_LOGO_BRAND=/assets/Velonex-headname1.png
```

#### Background Configuration

```bash
# Login page background
VITE_BG_LOGIN=/assets/institiute-bgg.jpg

# Institute background
VITE_BG_INSTITUTE=/assets/institute-photo.jpg
```

## Usage Examples

### Using Assets in Components

#### Import the asset utilities:

```typescript
import { assets, getLogoByBranchType, getLogoAltByBranchType } from '@/lib/config';
```

#### Get logos by type:

```typescript
// Get specific logos
const schoolLogo = assets.logo('school');
const collegeLogo = assets.logo('college');
const brandLogo = assets.logo('brand');

// Get logo based on branch type
const logo = getLogoByBranchType(branchType); // 'SCHOOL' or 'COLLEGE'
const altText = getLogoAltByBranchType(branchType);
```

#### Get backgrounds:

```typescript
const loginBg = assets.background('login');
const instituteBg = assets.background('institute');
```

#### Using in JSX:

```typescript
// Logo with branch type
<img 
  src={getLogoByBranchType(currentBranch?.branch_type)} 
  alt={getLogoAltByBranchType(currentBranch?.branch_type)}
/>

// Specific logo
<img src={assets.logo('school')} alt="School Logo" />

// Background image
<div style={{ backgroundImage: `url('${assets.background('login')}')` }}>
  {/* Content */}
</div>
```

### Production Deployment Examples

#### Example 1: CDN Hosting

For production deployment with assets hosted on a CDN:

```bash
# .env.production
VITE_ASSETS_BASE_URL=https://cdn.yourcompany.com
VITE_LOGO_SCHOOL=https://cdn.yourcompany.com/logos/nexzen-logo.png
VITE_LOGO_COLLEGE=https://cdn.yourcompany.com/logos/velocity-logo.png
VITE_LOGO_BRAND=https://cdn.yourcompany.com/logos/brand-logo.png
VITE_BG_LOGIN=https://cdn.yourcompany.com/backgrounds/login-bg.jpg
```

#### Example 2: Relative Paths

For standard deployment with assets in the public folder:

```bash
# .env.production
VITE_ASSETS_BASE_URL=
VITE_ASSETS_PATH=/assets
VITE_LOGO_SCHOOL=/assets/nexzen-logo.png
VITE_LOGO_COLLEGE=/assets/Velocity-logo.png
VITE_LOGO_BRAND=/assets/Velonex-headname1.png
VITE_BG_LOGIN=/assets/institiute-bgg.jpg
```

#### Example 3: Subdirectory Deployment

For deployment in a subdirectory (e.g., `/app/`):

```bash
# .env.production
VITE_BASE_PATH=/app/
VITE_ASSETS_PATH=/app/assets
VITE_LOGO_SCHOOL=/app/assets/nexzen-logo.png
VITE_LOGO_COLLEGE=/app/assets/Velocity-logo.png
```

## Default Values

If environment variables are not set, the system uses these default paths:

- **School Logo**: `/assets/nexzen-logo.png`
- **College Logo**: `/assets/Velocity-logo.png`
- **Brand Logo**: `/assets/Velonex-headname1.png`
- **Login Background**: `/assets/institiute-bgg.jpg`
- **Institute Background**: `/assets/institute-photo.jpg`

## Updated Components

The following components have been updated to use the new asset configuration system:

1. **Login.tsx** - Login page with logos and background
2. **Sidebar.tsx** - Sidebar logo based on branch type
3. **BranchSwitcher.tsx** - Branch switcher logos
4. **admissionsExport.ts** - PDF export logos (school and college)

## File Structure

```
client/src/lib/config/
├── assets.ts          # Asset configuration and utilities
└── index.ts           # Configuration exports
```

## Implementation Details

### Asset URL Resolution

The asset configuration system handles URL resolution in the following order:

1. **Full URL**: If the asset path starts with `http://` or `https://`, it's used as-is
2. **Base URL + Path**: If `VITE_ASSETS_BASE_URL` is set, it's combined with the asset path
3. **Relative Path**: Otherwise, uses the relative path as configured

### Branch Type Logic

The system automatically selects the correct logo based on branch type:
- `SCHOOL` → School logo (nexzen-logo.png)
- `COLLEGE` → College logo (Velocity-logo.png)
- `null` or `undefined` → Defaults to college logo

## Migration Guide

### Before

```typescript
// Hard-coded paths
<img src="/assets/nexzen-logo.png" alt="Logo" />
```

### After

```typescript
// Configurable via environment variables
import { assets } from '@/lib/config';
<img src={assets.logo('school')} alt="Logo" />
```

## Testing

To test different configurations:

1. Create a `.env.local` file with your test values
2. Restart the development server
3. Verify assets load correctly
4. Test with different base URLs and paths

## Production Checklist

Before deploying to production:

- [ ] Configure all asset paths in `.env.production`
- [ ] Test asset loading with production configuration
- [ ] Verify CDN URLs are accessible
- [ ] Test branch type logo switching
- [ ] Verify PDF exports include correct logos
- [ ] Test with different deployment paths if applicable

## Troubleshooting

### Assets Not Loading

1. Check environment variable names (must start with `VITE_`)
2. Verify asset paths are correct
3. Check browser console for 404 errors
4. Ensure assets exist in the specified locations
5. Restart development server after changing `.env` files

### CDN Assets Not Loading

1. Verify CORS is configured on CDN
2. Check CDN URL is accessible
3. Verify SSL certificates if using HTTPS
4. Check browser console for network errors

### Branch Type Logo Not Showing

1. Verify `currentBranch?.branch_type` is set correctly
2. Check that branch type is 'SCHOOL' or 'COLLEGE'
3. Verify logo paths in environment variables
4. Check console for errors

## Support

For issues or questions about asset configuration, please contact the development team or refer to the main project documentation.

