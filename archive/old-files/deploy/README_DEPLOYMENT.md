# Deploy TAP LMS to learningmanagementsystem.co.za

## Files to Upload

Upload all files in this `deploy` folder to your web hosting account:

### Core Files (Root Directory):
- `index.html` - Main website file
- `styles.css` - Website styling
- `script.js` - Interactive functionality

### Folders (Maintain Structure):
- `Documents/` folder with:
  - `tap-text-styles.css` - Typography styles
  - `Functionality.txt` - System documentation
- `Images/` folder with:
  - `Logo.png` - TAP logo

## Deployment Methods

### Method 1: cPanel File Manager (Recommended)
1. Login to your hosting control panel (cPanel)
2. Open "File Manager"
3. Navigate to `public_html` or `www` directory
4. Upload all files maintaining the folder structure:
   ```
   public_html/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── Documents/
   │   ├── tap-text-styles.css
   │   └── Functionality.txt
   └── Images/
       └── Logo.png
   ```

### Method 2: FTP Upload
Use an FTP client like FileZilla:
1. Connect to your FTP server
2. Navigate to the web root directory (public_html/www)
3. Upload all files maintaining folder structure

### Method 3: SFTP Command Line
```bash
# Replace with your actual server details
sftp username@learningmanagementsystem.co.za
cd public_html
put index.html
put styles.css  
put script.js
mkdir Documents
cd Documents
put Documents/tap-text-styles.css
put Documents/Functionality.txt
cd ..
mkdir Images
cd Images
put Images/Logo.png
```

## Domain Configuration

### DNS Settings (if not already configured):
Point your domain to your hosting server:
- A Record: `@` → Your server IP address
- CNAME Record: `www` → `learningmanagementsystem.co.za`

### SSL Certificate:
Ensure HTTPS is enabled:
- Most hosting providers offer free SSL certificates
- Enable "Force HTTPS" in your hosting control panel

## File Permissions
Set correct permissions after upload:
- Files: 644
- Directories: 755

## Testing Checklist

After deployment, test:
- [ ] Website loads at https://learningmanagementsystem.co.za
- [ ] All images display (especially TAP logo)
- [ ] Navigation works between sections
- [ ] Contact form functions
- [ ] Mobile responsive design
- [ ] HTTPS is working (secure connection)
- [ ] Page load speed is acceptable

## Troubleshooting

### Common Issues:
1. **Images not showing**: Check file paths and case sensitivity
2. **CSS not loading**: Verify file permissions and paths
3. **404 errors**: Ensure all files are in correct directories
4. **HTTPS issues**: Contact hosting provider for SSL setup

### Support:
Contact your hosting provider if you need help with:
- File uploads
- Domain configuration
- SSL certificate setup
- Server permissions