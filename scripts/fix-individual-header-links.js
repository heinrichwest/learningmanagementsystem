const fs = require('fs');
const path = require('path');

const categoriesDir = path.join('pages', 'courses', 'categories');
const individualsDir = path.join('pages', 'courses', 'individual');

function getCategorySlugs() {
  const files = fs.readdirSync(categoriesDir, { withFileTypes: true });
  return new Set(
    files
      .filter((f) => f.isFile() && f.name.endsWith('.html'))
      .map((f) => f.name)
  );
}

function fixFile(filePath, slugs) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace only hrefs that point to ../../../pages/<slug>.html where slug exists in categories
  content = content.replace(/href=\"\.\.\/\.\.\/\.\.\/pages\/([a-z0-9-]+\.html)\"/g, (m, slug) => {
    if (slugs.has(slug)) {
      changed = true;
      return `href=\"../../../pages/courses/categories/${slug}\"`;
    }
    return m;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function run() {
  const slugs = getCategorySlugs();
  const files = fs.readdirSync(individualsDir, { withFileTypes: true });
  let updated = 0;
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const p = path.join(individualsDir, entry.name);
    if (fixFile(p, slugs)) updated++;
  }
  console.log(`Updated ${updated} individual course files.`);
}

run();

