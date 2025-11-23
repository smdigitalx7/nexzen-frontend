# Multi-Brand Deployment Guide - Quick Start

## 🚀 Deploying to Another VPS with Different Brand

This guide explains how to deploy the same frontend codebase on a different VPS with a completely different brand name.

## ✅ What You Need

1. Access to a new VPS server
2. Your new brand's logos and images
3. Your new brand's information (name, contact details, website)

## 📋 Quick Steps

### 1. Copy Codebase to New VPS

```bash
# On your new VPS
cd /var/www
git clone <your-repo-url> your-brand-erp
cd your-brand-erp
npm install
```

### 2. Create Environment Configuration

Create `.env.production` file:

```bash
cp env.template .env.production
nano .env.production
```

### 3. Configure Your Brand

Edit `.env.production` with your new brand details:

```bash
# Your New Brand Configuration
VITE_BRAND_NAME=YourBrandName
VITE_BRAND_CONTACT_EMAIL=support@yourbrand.com
VITE_BRAND_CONTACT_PHONE=+1234567890
VITE_BRAND_WEBSITE=https://www.yourbrand.com
VITE_BRAND_WEBSITE_NAME=YourBrand

# Your Logo Paths (upload to client/public/assets/)
VITE_LOGO_SCHOOL=/assets/your-school-logo.png
VITE_LOGO_COLLEGE=/assets/your-college-logo.png
VITE_LOGO_BRAND=/assets/your-brand-logo.png
VITE_BG_LOGIN=/assets/your-login-bg.jpg

# Default names for PDFs
VITE_BRAND_DEFAULT_SCHOOL_NAME=YOUR BRAND SCHOOL
VITE_BRAND_DEFAULT_COLLEGE_NAME=YOUR BRAND COLLEGE
```

### 4. Upload Your Brand Assets

```bash
# Upload your logos and backgrounds
cp /path/to/your/assets/* client/public/assets/
```

Your assets should include:

- School logo (PNG)
- College logo (PNG)
- Brand logo (PNG)
- Login background (JPG)
- Institute background (JPG)

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy

Deploy the `dist` folder to your web server (Nginx, Apache, etc.)

## 📦 Complete Example Configuration

Here's a complete example for a brand called "EduSys":

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
VITE_BRAND_KEYWORDS=edusys, school management, education, erp

# Assets
VITE_LOGO_SCHOOL=/assets/edusys-school-logo.png
VITE_LOGO_COLLEGE=/assets/edusys-college-logo.png
VITE_LOGO_BRAND=/assets/edusys-brand-logo.png
VITE_BG_LOGIN=/assets/edusys-login-bg.jpg
VITE_BG_INSTITUTE=/assets/edusys-institute-bg.jpg

# API Configuration (if different)
VITE_API_BASE_URL=/api
```

## 🎨 What Gets Customized Automatically

When you configure these environment variables, everything is automatically customized:

### ✅ Assets

- ✅ Login page logos (school and college)
- ✅ Login page background
- ✅ Sidebar logo (changes based on branch type)
- ✅ Branch switcher logos
- ✅ PDF export logos

### ✅ Brand Text

- ✅ Page title and meta tags
- ✅ Footer copyright text
- ✅ Contact information (email and phone)
- ✅ Support links
- ✅ Default branch names in PDFs
- ✅ SEO keywords and descriptions

### ✅ Application

- ✅ Brand name throughout the app
- ✅ Website links
- ✅ Contact information
- ✅ Application name

## 📝 Environment Variables Reference

### Required Variables

| Variable                   | Description       | Example                    |
| -------------------------- | ----------------- | -------------------------- |
| `VITE_BRAND_NAME`          | Main brand name   | `YourBrand`                |
| `VITE_BRAND_CONTACT_EMAIL` | Support email     | `support@yourbrand.com`    |
| `VITE_BRAND_CONTACT_PHONE` | Support phone     | `+1234567890`              |
| `VITE_LOGO_SCHOOL`         | School logo path  | `/assets/school-logo.png`  |
| `VITE_LOGO_COLLEGE`        | College logo path | `/assets/college-logo.png` |
| `VITE_BG_LOGIN`            | Login background  | `/assets/login-bg.jpg`     |

### Optional Variables

| Variable                          | Description          | Default                      |
| --------------------------------- | -------------------- | ---------------------------- |
| `VITE_BRAND_DESCRIPTION`          | SEO description      | Auto-generated               |
| `VITE_BRAND_WEBSITE`              | Brand website        | `https://www.smdigitalx.com` |
| `VITE_BRAND_WEBSITE_NAME`         | Website display name | `SMDigitalX`                 |
| `VITE_BRAND_DEFAULT_SCHOOL_NAME`  | PDF school name      | `VELONEX SCHOOL`             |
| `VITE_BRAND_DEFAULT_COLLEGE_NAME` | PDF college name     | `VELONEX COLLEGE`            |
| `VITE_BRAND_FOOTER_TEXT`          | Footer template      | Auto-generated               |
| `VITE_BRAND_APP_TITLE`            | App title template   | Auto-generated               |

## 🔧 Using CDN for Assets

If you want to host assets on a CDN instead:

```bash
VITE_ASSETS_BASE_URL=https://cdn.yourbrand.com
VITE_LOGO_SCHOOL=https://cdn.yourbrand.com/logos/school-logo.png
VITE_LOGO_COLLEGE=https://cdn.yourbrand.com/logos/college-logo.png
VITE_LOGO_BRAND=https://cdn.yourbrand.com/logos/brand-logo.png
VITE_BG_LOGIN=https://cdn.yourbrand.com/backgrounds/login-bg.jpg
```

## ✅ Checklist Before Deployment

- [ ] All environment variables configured in `.env.production`
- [ ] Brand assets uploaded to `client/public/assets/`
- [ ] Build completes without errors (`npm run build`)
- [ ] All logos and backgrounds load correctly
- [ ] Brand text appears correctly
- [ ] Contact information is updated
- [ ] Footer text is correct
- [ ] PDF exports show correct brand names
- [ ] Page title is updated
- [ ] Meta tags are updated

## 🎯 Next Steps

1. **Test Locally**: Build and preview locally first

   ```bash
   npm run build
   npm run preview
   ```

2. **Deploy to Staging**: Test on a staging server first

3. **Deploy to Production**: Deploy to production after testing

## 📚 Additional Documentation

For detailed information, see:

- `docs/MULTI_BRAND_DEPLOYMENT.md` - Complete deployment guide
- `docs/ASSET_CONFIGURATION.md` - Asset configuration details
- `env.template` - All available environment variables

## 🆘 Troubleshooting

### Assets Not Loading

- Check asset paths in `.env.production`
- Verify assets exist in `client/public/assets/`
- Check browser console for 404 errors

### Brand Text Not Updating

- Verify environment variables are set
- Restart build after changing `.env` files
- Clear browser cache

### Build Errors

- Check all required variables are set
- Verify asset paths are correct
- Ensure Node.js version is 18+ or 20+

## 💡 Tips

1. **Use separate `.env` files** for different environments:
   - `.env.development` - Local development
   - `.env.staging` - Staging environment
   - `.env.production` - Production environment

2. **Don't commit `.env.production`** to version control

3. **Optimize your assets** before uploading:
   - Compress images
   - Use WebP format when possible
   - Ensure logos are properly sized

4. **Test thoroughly** before going live

---

**That's it!** With these environment variables configured, your entire application will be branded with your new brand name. No code changes needed!
