# TAP Learning Management System Website

## Folder Structure

```
learningmanagementsystem/
├── index.html                 # Main landing page
├── assets/                    # All static assets
│   ├── css/                  # Stylesheets
│   │   ├── styles.css        # Main styles
│   │   ├── white-navbar.css  # Navbar specific styles
│   │   └── course-page.css   # Course page styles
│   ├── js/                   # JavaScript files
│   │   └── script.js         # Main JavaScript
│   ├── images/               # All images
│   │   ├── logo/            # Logo images
│   │   ├── features/        # Feature images
│   │   ├── categories/      # Category images
│   │   └── courses/         # Course specific images
│   └── videos/              # Video files
├── pages/                    # All HTML pages
│   ├── courses/             # Course related pages
│   │   ├── categories/      # Category listing pages
│   │   └── individual/      # Individual course pages
│   ├── features/            # Feature pages
│   ├── courses.html         # Main courses page
│   ├── features.html        # Main features page
│   ├── pricing.html         # Pricing page
│   └── solutions.html       # Solutions page
├── config/                   # Configuration files
│   ├── server.js            # Development server
│   └── start-server.bat     # Server start script
├── docs/                     # Documentation
│   ├── CLAUDE.md            # Claude AI instructions
│   ├── deploy_instructions.md
│   └── TAP_Website_Structure_and_Keywords.md
└── archive/                  # Archived/unused files
    ├── backup/              # Backup files
    ├── unused-scripts/      # Unused JavaScript files
    └── old-files/           # Old project files

```

## Development

To start the development server:

```bash
cd config
node server.js
```

Or use the batch file:
```bash
config/start-server.bat
```

The website will be available at http://localhost:5000

## File Path Updates

All paths have been updated to reflect the new structure:
- CSS files: `/assets/css/`
- JavaScript: `/assets/js/`
- Images: `/assets/images/`
- Videos: `/assets/videos/`
- Course pages: `/pages/courses/`
- Feature pages: `/pages/features/`