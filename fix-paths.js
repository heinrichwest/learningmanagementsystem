const fs = require('fs');
const path = require('path');

// Function to determine the relative path based on file location
function getRelativePath(filePath) {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(part => part !== '');
    const depth = parts.length - 1; // Subtract 1 for the filename

    if (depth === 0) return './'; // Root level
    if (depth === 1) return '../'; // One level deep (pages/)
    if (depth === 2) return '../../'; // Two levels deep (pages/features/, pages/courses/)
    if (depth === 3) return '../../../'; // Three levels deep (pages/courses/categories/, pages/courses/individual/)
    return '../'.repeat(depth);
}

// Function to update paths in HTML file
function updateHTMLPaths(filePath) {
    console.log(`Updating: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = getRelativePath(filePath);

    // Store original for comparison
    const originalContent = content;

    // Update CSS paths
    content = content.replace(/href="\.\.?\/Theme\/public\//g, `href="${relativePath}archive/old-files/Theme/public/`);
    content = content.replace(/href="\.\.?\/white-navbar\.css"/g, `href="${relativePath}assets/css/white-navbar.css"`);
    content = content.replace(/href="\.\.?\/styles\.css"/g, `href="${relativePath}assets/css/styles.css"`);
    content = content.replace(/href="\.\.?\/courses\/course-page\.css"/g, `href="${relativePath}assets/css/course-page.css"`);
    content = content.replace(/href="\.\.?\/(\.\.\/)?course-page\.css"/g, `href="${relativePath}assets/css/course-page.css"`);

    // Update JavaScript paths
    content = content.replace(/src="\.\.?\/Theme\/public\//g, `src="${relativePath}archive/old-files/Theme/public/`);
    content = content.replace(/src="\.\.?\/script\.js"/g, `src="${relativePath}assets/js/script.js"`);

    // Update image paths
    content = content.replace(/src="\.\.?\/Images\/Logo\.png"/g, `src="${relativePath}assets/images/logo/Logo.png"`);
    content = content.replace(/href="\.\.?\/Images\/Logo\.png"/g, `href="${relativePath}assets/images/logo/Logo.png"`);
    content = content.replace(/src="\.\.?\/Images\/Categories\//g, `src="${relativePath}assets/images/categories/`);
    content = content.replace(/src="\.\.?\/Images\/Course_Images\//g, `src="${relativePath}assets/images/courses/`);
    content = content.replace(/src="\.\.?\/Images\/features\.png"/g, `src="${relativePath}assets/images/features/features.png"`);

    // Update video paths
    content = content.replace(/src="\.\.?\/Videos\//g, `src="${relativePath}assets/videos/`);

    // Update navigation links
    content = content.replace(/href="\.\.?\/index\.html"/g, `href="${relativePath}index.html"`);
    content = content.replace(/href="\.\.?\/features\.html"/g, `href="${relativePath}pages/features.html"`);
    content = content.replace(/href="\.\.?\/solutions\.html"/g, `href="${relativePath}pages/solutions.html"`);
    content = content.replace(/href="\.\.?\/courses\.html"/g, `href="${relativePath}pages/courses.html"`);
    content = content.replace(/href="\.\.?\/pricing\.html"/g, `href="${relativePath}pages/pricing.html"`);
    content = content.replace(/href="\.\.?\/pages\/about\.html"/g, `href="${relativePath}pages/about.html"`);

    // Update feature page links
    content = content.replace(/href="\.\.?\/features\//g, `href="${relativePath}pages/features/`);

    // Update course category links
    content = content.replace(/href="\.\.?\/courses\/([^"]+\.html)"/g, (match, p1) => {
        // Check if it's an individual course (contains 'individual/')
        if (p1.includes('individual/')) {
            return `href="${relativePath}pages/courses/${p1}"`;
        }
        // Otherwise it's a category page
        return `href="${relativePath}pages/courses/categories/${p1}"`;
    });

    // Fix any double slashes
    content = content.replace(/([^:])\/\//g, '$1/');

    // Write back only if content changed
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Updated ${filePath}`);
    } else {
        console.log(`  - No changes needed for ${filePath}`);
    }
}

// Process all HTML files
function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            updateHTMLPaths(fullPath);
        }
    });
}

// Update root index.html (already done, but let's ensure it's correct)
console.log('\n=== Updating root files ===');
updateHTMLPaths('index.html');

// Update all pages
console.log('\n=== Updating pages directory ===');
processDirectory('pages');

console.log('\n✅ Path updates complete!');