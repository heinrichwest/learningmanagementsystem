const fs = require('fs');
const path = require('path');

function fixAllPaths(filePath) {
    console.log(`Fixing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Determine depth from root
    let depth = 0;
    if (normalizedPath.includes('pages/')) depth++;
    if (normalizedPath.includes('pages/features/')) depth = 2;
    if (normalizedPath.includes('pages/courses/')) depth = 2;
    if (normalizedPath.includes('pages/courses/categories/')) depth = 3;
    if (normalizedPath.includes('pages/courses/individual/')) depth = 3;

    const toRoot = depth === 0 ? './' : '../'.repeat(depth);

    // Fix all asset paths to be relative to root
    content = content.replace(/href="[\.\/]*archive\/old-files\/Theme\//g, `href="${toRoot}archive/old-files/Theme/`);
    content = content.replace(/src="[\.\/]*archive\/old-files\/Theme\//g, `src="${toRoot}archive/old-files/Theme/`);
    content = content.replace(/href="[\.\/]*assets\/css\//g, `href="${toRoot}assets/css/`);
    content = content.replace(/src="[\.\/]*assets\/(js|images|videos)\//g, `src="${toRoot}assets/$1/`);

    // Fix logo and other image references
    content = content.replace(/src="[\.\/]*Images\/Logo\.png"/g, `src="${toRoot}assets/images/logo/Logo.png"`);
    content = content.replace(/href="[\.\/]*Images\/Logo\.png"/g, `href="${toRoot}assets/images/logo/Logo.png"`);

    // Fix navigation to index
    content = content.replace(/href="[\.\/]*index\.html"/g, `href="${toRoot}index.html"`);

    // Fix navigation to main pages
    content = content.replace(/href="[\.\/]*pages\/(features|courses|pricing|solutions|about)\.html"/g, `href="${toRoot}pages/$1.html"`);

    // Fix navigation to feature pages
    content = content.replace(/href="[\.\/]*pages\/features\/([^"]+)"/g, `href="${toRoot}pages/features/$1"`);

    // Fix navigation to course category pages
    content = content.replace(/href="[\.\/]*pages\/courses\/categories\/([^"]+)"/g, `href="${toRoot}pages/courses/categories/$1"`);

    // Fix navigation to individual course pages
    if (depth === 3 && normalizedPath.includes('categories/')) {
        // From category page to individual pages (same folder level)
        content = content.replace(/href="\.\/individual\/([^"]+)"/g, `href="../individual/$1"`);
        // Links to other category pages (same folder)
        content = content.replace(/href="\.\/([a-z-]+\.html)"/g, (match, p1) => {
            if (!p1.includes('/')) {
                return `href="./${p1}"`;
            }
            return match;
        });
    }

    // Fix broken About link
    content = content.replace(/href="[\.\/]+\.\.\.\/[\.\/]*pages\/about\.html"/g, `href="${toRoot}pages/about.html"`);

    // Clean up any double slashes
    content = content.replace(/([^:])\/\//g, '$1/');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Fixed ${filePath}`);
}

// Fix all HTML files
function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.html')) {
            fixAllPaths(fullPath);
        }
    });
}

console.log('=== Fixing all HTML paths ===\n');

// Fix root
fixAllPaths('index.html');

// Fix all pages
processDirectory('pages');

console.log('\n✅ All paths fixed!');