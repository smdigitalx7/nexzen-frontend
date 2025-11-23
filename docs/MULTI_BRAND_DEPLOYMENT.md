# Multi-Brand Deployment Guide

## Overview

This guide explains how to deploy the same frontend codebase on a different VPS with a different brand name. All branding, logos, backgrounds, and brand-specific text are configurable via environment variables.

## Quick Start

To deploy with a new brand on another VPS, you only need to:

1. **Copy the codebase** to your new VPS
2. **Configure environment variables** for the new brand
3. **Upload new brand assets** (logos, backgrounds)
4. **Build and deploy** the application

## Step-by-Step Guide

### 1. Prepare Your New VPS

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (or your preferred web server)
sudo apt-get install nginx

# Create deployment directory
sudo mkdir -p /var/www/your-brand-erp
sudo chown $USER:$USER /var/www/your-brand-erp
```

### 2. Clone/Copy the Codebase

```bash
# Clone the repository or copy files
cd /var/www/your-brand-erp
git clone <repository-url> .
# OR copy files from existing deployment
```

### 3. Install Dependencies

```bash
cd /var/www/your-brand-erp
npm install
```

### 4. Configure Environment Variables

Create a `.env.production` file with your new brand configuration:

```bash
cp env.template .env.production
nano .env.production
```

#### Example Configuration for New Brand:

```bash
# API Configuration (update if needed)
VITE_API_BASE_URL=/api

# Asset Configuration - Upload assets to public/assets or use CDN
VITE_ASSETS_BASE_URL=
VITE_ASSETS_PATH=/assets

# Logo Configuration - Paths to your new brand logos
VITE_LOGO_SCHOOL=/assets/your-school-logo.png
VITE_LOGO_COLLEGE=/assets/your-college-logo.png
VITE_LOGO_BRAND=/assets/your-brand-logo.png

# Background Configuration
VITE_BG_LOGIN=/assets/your-login-background.jpg
VITE_BG_INSTITUTE=/assets/your-institute-background.jpg

# Brand Configuration - Your new brand details
VITE_BRAND_NAME=YourBrandName
VITE_BRAND_DESCRIPTION=Your brand description for SEO and meta tags
VITE_BRAND_CONTACT_EMAIL=support@yourbrand.com
VITE_BRAND_CONTACT_PHONE=+1234567890
VITE_BRAND_WEBSITE=https://www.yourbrand.com
VITE_BRAND_WEBSITE_NAME=YourBrand
VITE_BRAND_DEFAULT_SCHOOL_NAME=YOUR BRAND SCHOOL
VITE_BRAND_DEFAULT_COLLEGE_NAME=YOUR BRAND COLLEGE
VITE_BRAND_FOOTER_TEXT=© {year} {brand} - Made with 🤍 by {website}
VITE_BRAND_APP_TITLE={brand} - Educational Institute Management
VITE_BRAND_KEYWORDS=your, keywords, here

# Base Path (if deploying to subdirectory)
VITE_BASE_PATH=/
```

#### Alternative: Using CDN for Assets

If you want to host assets on a CDN:

```bash
VITE_ASSETS_BASE_URL=https://cdn.yourbrand.com
VITE_LOGO_SCHOOL=https://cdn.yourbrand.com/logos/school-logo.png
VITE_LOGO_COLLEGE=https://cdn.yourbrand.com/logos/college-logo.png
VITE_LOGO_BRAND=https://cdn.yourbrand.com/logos/brand-logo.png
VITE_BG_LOGIN=https://cdn.yourbrand.com/backgrounds/login-bg.jpg
```

### 5. Upload Brand Assets

Upload your brand's logos and backgrounds to the public assets folder:

```bash
# Create assets directory
mkdir -p client/public/assets

# Upload your assets
# - your-school-logo.png
# - your-college-logo.png
# - your-brand-logo.png
# - your-login-background.jpg
# - your-institute-background.jpg
```

### 6. Build for Production

```bash
# Build the application
npm run build

# The built files will be in the 'dist' directory
```

### 7. Configure Web Server (Nginx Example)

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/your-brand-erp
```

```nginx
server {
    listen 80;
    server_name your-brand-domain.com;

    root /var/www/your-brand-erp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://your-api-url.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/your-brand-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Set Up SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-brand-domain.com
```

## Configuration Reference

### Required Environment Variables

| Variable                   | Description       | Example                    |
| -------------------------- | ----------------- | -------------------------- |
| `VITE_BRAND_NAME`          | Main brand name   | `YourBrand`                |
| `VITE_BRAND_CONTACT_EMAIL` | Support email     | `support@yourbrand.com`    |
| `VITE_BRAND_CONTACT_PHONE` | Support phone     | `+1234567890`              |
| `VITE_LOGO_SCHOOL`         | School logo path  | `/assets/school-logo.png`  |
| `VITE_LOGO_COLLEGE`        | College logo path | `/assets/college-logo.png` |
| `VITE_BG_LOGIN`            | Login background  | `/assets/login-bg.jpg`     |

### Optional Environment Variables

| Variable                          | Description              | Default                      |
| --------------------------------- | ------------------------ | ---------------------------- |
| `VITE_BRAND_DESCRIPTION`          | SEO description          | Auto-generated               |
| `VITE_BRAND_WEBSITE`              | Brand website URL        | `https://www.smdigitalx.com` |
| `VITE_BRAND_WEBSITE_NAME`         | Website display name     | `SMDigitalX`                 |
| `VITE_BRAND_DEFAULT_SCHOOL_NAME`  | Default PDF school name  | `VELONEX SCHOOL`             |
| `VITE_BRAND_DEFAULT_COLLEGE_NAME` | Default PDF college name | `VELONEX COLLEGE`            |
| `VITE_BRAND_FOOTER_TEXT`          | Footer text template     | Auto-generated               |
| `VITE_ASSETS_BASE_URL`            | CDN base URL             | Empty (uses relative paths)  |

## What Gets Customized

When you configure environment variables, the following will be automatically customized:

### ✅ Assets (Logos & Backgrounds)

- Login page logos (school and college)
- Login page background
- Sidebar logo (based on branch type)
- Branch switcher logos
- PDF export logos

### ✅ Brand Text

- Page title and meta tags
- Footer copyright text
- Contact information (email and phone)
- Support links
- Default branch names in PDFs
- SEO keywords and descriptions

### ✅ Brand Information

- Brand name throughout the application
- Website links
- Contact information
- Application name

## Assets Specifications

### Recommended Logo Specifications:

- **School Logo**: 512x512px or larger, PNG with transparent background
- **College Logo**: 512x512px or larger, PNG with transparent background
- **Brand Logo**: 256x64px (header/headname style), PNG with transparent background

### Recommended Background Specifications:

- **Login Background**: 1920x1080px, JPG format
- **Institute Background**: 1920x1080px, JPG format

### Asset Naming:

You can name your assets anything you want, just ensure the paths in `.env.production` match your file names.

## Testing Your Deployment

1. **Build locally first**:

   ```bash
   npm run build
   npm run preview
   ```

2. **Check that assets load**:
   - Visit the login page
   - Verify logos display correctly
   - Check background images
   - Verify branch switcher logos

3. **Check brand text**:
   - Verify page title
   - Check footer text
   - Test contact links (email and phone)
   - Verify PDF exports show correct brand name

4. **Test in production**:
   - Deploy to staging first
   - Test all functionality
   - Verify all assets load
   - Check SEO meta tags

## Troubleshooting

### Assets Not Loading

1. Check file paths in `.env.production`
2. Verify assets exist in `client/public/assets/`
3. Check browser console for 404 errors
4. Ensure file permissions are correct: `chmod 644 client/public/assets/*`

### Brand Text Not Updating

1. Verify environment variables are set correctly
2. Restart the build process after changing `.env` files
3. Clear browser cache
4. Check that `.env.production` is being used (not `.env.development`)

### Build Errors

1. Check all required environment variables are set
2. Verify asset paths are correct
3. Check for typos in environment variable names
4. Ensure Node.js version is 18+ or 20+

## Best Practices

### 1. Separate Environments

Keep separate environment files for different deployments:

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### 2. Version Control

**DO NOT commit `.env.production` to version control**. Add to `.gitignore`:

```gitignore
.env
.env.local
.env.production
.env.*.local
```

### 3. Asset Optimization

- Optimize images before uploading (use tools like ImageOptim, TinyPNG)
- Use WebP format where possible for better compression
- Ensure logos are properly sized to avoid large file sizes

### 4. CDN Deployment

For better performance, consider hosting assets on a CDN:

- Faster asset delivery
- Reduced server load
- Better caching strategies
- Geographic distribution

### 5. Monitoring

Set up monitoring for:

- Asset loading errors
- Build failures
- Performance metrics
- User analytics

## Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are configured
- [ ] Brand assets are uploaded and accessible
- [ ] Build completes without errors
- [ ] All logos and backgrounds load correctly
- [ ] Brand text appears correctly throughout the app
- [ ] Contact information is updated
- [ ] Footer text is correct
- [ ] PDF exports show correct brand names
- [ ] SEO meta tags are updated
- [ ] SSL certificate is configured
- [ ] API endpoints are configured correctly
- [ ] Error monitoring is set up
- [ ] Backup strategy is in place

## Example: Complete Brand Migration

Here's a complete example of migrating from "Velonex" to "EduSys":

```bash
# .env.production
VITE_BRAND_NAME=EduSys
VITE_BRAND_DESCRIPTION=EduSys - Advanced Educational Management System
VITE_BRAND_CONTACT_EMAIL=support@edusys.com
VITE_BRAND_CONTACT_PHONE=+1-555-123-4567
VITE_BRAND_WEBSITE=https://www.edusys.com
VITE_BRAND_WEBSITE_NAME=EduSys
VITE_BRAND_DEFAULT_SCHOOL_NAME=EDUSYS SCHOOL
VITE_BRAND_DEFAULT_COLLEGE_NAME=EDUSYS COLLEGE
VITE_BRAND_FOOTER_TEXT=© {year} {brand} - Educational Excellence
VITE_BRAND_APP_TITLE={brand} - School Management System

VITE_LOGO_SCHOOL=/assets/edusys-school-logo.png
VITE_LOGO_COLLEGE=/assets/edusys-college-logo.png
VITE_LOGO_BRAND=/assets/edusys-brand-logo.png
VITE_BG_LOGIN=/assets/edusys-login-bg.jpg
```

After configuring, rebuild and redeploy!

## Support

For deployment issues or questions, refer to:

- `docs/ASSET_CONFIGURATION.md` - Asset configuration guide
- `ASSET_CONFIGURATION_SUMMARY.md` - Configuration summary
