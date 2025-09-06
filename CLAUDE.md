# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for TAP (Technical Assessment Portal), a Learning Management System. The project consists of HTML, CSS, and JavaScript files that create a single-page application showcasing the LMS platform's features and capabilities.

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

## Development Commands

### Local Development Server
```bash
node server.js
```
Starts a local HTTP server on port 5000 (or PORT environment variable). The server serves static files with proper MIME types and includes 404 handling.

### No Build Process
This is a static website with no build, compilation, or bundling steps. All files are served directly.

### No Testing Framework
No automated tests are currently implemented. Testing is done manually through browser testing.

## Code Organization

### JavaScript Architecture (`script.js`)
- **Modular Functions**: Each functionality is separated into init functions
- **Event-Driven**: Uses DOM event listeners and Intersection Observer API
- **Animation System**: Scroll-based animations using Intersection Observer
- **Form Handling**: Client-side form validation with simulated submission
- **Mobile Menu**: Responsive navigation with hamburger menu
- **Utility Functions**: Debounce and throttle for performance optimization

### CSS Architecture (`styles.css`)
- **Responsive Design**: Mobile-first approach with breakpoints
- **CSS Custom Properties**: Uses CSS variables for consistent theming
- **Component-Based**: Styles organized by component (navbar, hero, features, etc.)
- **Animation-Ready**: CSS transitions and transforms for JavaScript animations

### HTML Structure (`index.html`)
- **Single Page Application**: All content in one file with section-based navigation
- **SEO Optimized**: Complete meta tags, structured data (JSON-LD), and semantic HTML
- **Accessibility**: Proper ARIA attributes and semantic markup
- **Performance**: Optimized fonts loading and proper image attributes

## Key Features & Functionality

### Navigation System
- Smooth scrolling between sections
- Active section highlighting
- Mobile hamburger menu with animations
- Header background changes on scroll

### Animation System
- Intersection Observer for scroll-triggered animations
- Counter animations for statistics
- Fade-in effects for cards and sections
- Performance-optimized with debouncing

### Form System
- Contact form with client-side validation
- Error display with styled messages
- Success feedback simulation
- Form reset after submission

### Responsive Design
- Mobile-first CSS approach
- Breakpoints for tablet and desktop
- Touch-friendly mobile interactions
- Optimized typography scaling

## Deployment

The website is designed for static hosting and can be deployed to:
- Traditional web hosting (cPanel, FTP)
- Static hosting services (Netlify, Vercel)
- GitHub Pages
- Any web server capable of serving static files

Refer to `deploy_instructions.md` for detailed deployment steps to various platforms.

## SEO & Content Strategy

The `TAP_Website_Structure_and_Keywords.md` file contains comprehensive SEO strategy including:
- Keyword mapping for each section
- Structured data implementation
- Meta tag optimization
- Performance optimization guidelines
- Content expansion opportunities

## Development Considerations

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