# TAP LMS Website Deployment Instructions

## Files to Upload
Upload these files to your web server's public directory (usually `public_html`, `www`, or `htdocs`):

### Core Website Files:
- `index.html` (main website file)
- `styles.css` (styling)
- `script.js` (functionality)
- `Documents/tap-text-styles.css` (typography styles)
- `Images/Logo.png` (TAP logo)

### Documentation:
- `TAP_Website_Structure_and_Keywords.md` (SEO guide)

## Deployment Options:

### 1. FTP/SFTP Upload
```bash
# Using command line FTP (replace with your server details)
ftp your-server.com
# Login with your credentials
# Navigate to public directory
cd public_html
# Upload files
put index.html
put styles.css
put script.js
mkdir Documents
cd Documents
put Documents/tap-text-styles.css
cd ..
mkdir Images
cd Images
put Images/Logo.png
```

### 2. Using FileZilla (GUI FTP Client)
1. Download FileZilla from https://filezilla-project.org/
2. Connect to your server using your FTP credentials
3. Drag and drop all files to the public directory
4. Maintain the folder structure (Documents/ and Images/)

### 3. Using Web Host Control Panel
Most web hosting providers offer file managers:
1. Login to your hosting control panel (cPanel, Plesk, etc.)
2. Open File Manager
3. Navigate to public_html or www directory
4. Upload all files maintaining the folder structure

### 4. Using Git (if your host supports it)
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial TAP LMS website deployment"

# Add your server as remote (replace with your details)
git remote add origin your-git-repo-url
git push -u origin main
```

## Server Configuration Notes:

### Apache (.htaccess)
Create a `.htaccess` file in the root directory:
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### Nginx Configuration
Add to your Nginx server block:
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1M;
    add_header Cache-Control "public, immutable";
}

location / {
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## Post-Deployment Checklist:

### ✅ Verify Files
- [ ] Website loads at your domain
- [ ] All images display correctly
- [ ] Navigation links work
- [ ] Contact form functions
- [ ] Mobile responsive design works
- [ ] CSS styling applies correctly

### ✅ SEO Setup
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Verify meta tags are working
- [ ] Check page load speed
- [ ] Test mobile-friendliness

### ✅ Performance
- [ ] Enable server compression
- [ ] Set up browser caching
- [ ] Optimize images if needed
- [ ] Test loading speeds

## Domain and DNS Configuration:

If you need to point a domain to your website:

1. **Domain Registrar**: Update DNS records
2. **A Record**: Point to your server's IP address
3. **WWW Subdomain**: Create CNAME record pointing to your domain
4. **SSL Certificate**: Ensure HTTPS is enabled

## Common Hosting Platforms:

### Netlify (Free Option)
1. Drag and drop all files to netlify.com
2. Automatic deployment and HTTPS
3. Custom domain support

### Vercel (Free Option)
1. Connect GitHub repository
2. Automatic deployments
3. Global CDN

### Traditional Web Hosting
- Upload via FTP/File Manager
- Ensure PHP/server requirements are met
- Configure domain and DNS

## Support and Troubleshooting:

### Common Issues:
1. **Images not loading**: Check file paths and case sensitivity
2. **CSS not applying**: Verify file paths in HTML
3. **404 errors**: Ensure all files are uploaded
4. **Mobile issues**: Test responsive design

### Contact Information:
- Website: TAP LMS
- For technical support with deployment, consult your hosting provider's documentation

---

**Note**: Replace placeholder URLs and credentials with your actual server information.