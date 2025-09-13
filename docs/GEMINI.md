# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

This is a static website for TAP (Technical Assessment Portal), a Learning Management System. The project consists of HTML, CSS, and JavaScript files that create a single-page application showcasing the LMS platform's features and capabilities. The website is built using `gulp` and the source code is located in the `Theme` directory.

## Architecture & Structure

### Core Files
- `index.html` - Main website file with all sections (hero, features, solutions, academy, pricing, contact)
- `styles.css` - Main stylesheet with responsive design and animations
- `script.js` - JavaScript functionality for navigation, animations, form handling, and mobile menu
- `server.js` - Simple Node.js HTTP server for local development

### Supporting Files
- `Documents/tap-text-styles.css` - Typography-specific styles
- `Images/Logo.png` - TAP logo image
- `Documents/Functionality.txt` - System documentation
- `TAP_Website_Structure_and_Keywords.md` - Comprehensive SEO and content strategy guide
- `deploy_instructions.md` - Deployment guidelines

### Deployment Structure
The `deploy/` folder contains a ready-to-deploy version of the website with the same file structure optimized for production hosting.

## Building and Running

### Local Development Server
To start a local development server, run the following command:
```bash
node server.js
```
This will start a local HTTP server on port 5000 (or PORT environment variable). The server serves static files with proper MIME types and includes 404 handling.

### Build Process
To build the website, navigate to the `Theme` directory and run the following command:
```bash
npm install && npm run build
```
This will install the necessary dependencies and build the website. The compiled assets will be placed in the `live` directory.

### No Testing Framework
No automated tests are currently implemented. Testing is done manually through browser testing.

## Development Conventions

### Code Style
- Modern JavaScript (ES6+) features used throughout
- CSS follows BEM-like naming conventions
- Consistent indentation and formatting
- Comprehensive comments for complex functionality

### Performance
- Optimized font loading with preconnect hints
- Efficient scroll event handling with throttling/debouncing
- Minimal JavaScript for core functionality
- Responsive images and proper sizing

### Browser Support
- Modern browsers (ES6+ support required)
- Mobile responsive design
- Progressive enhancement approach
- Graceful degradation for older browsers
