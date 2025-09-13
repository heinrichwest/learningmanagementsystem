// Update course tile images on category pages to use uploaded PNGs
// Scans courses/*.html (excluding individual pages) and replaces each tile's <img src>
// based on the <h3> title, mapping to files in Images/Course_Images/TAP_Courses_PNG_FIles

const fs = require('fs');
const path = require('path');

const ROOT = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const COURSES_DIR = path.join(ROOT, 'courses');
const IMAGES_DIR = path.join(ROOT, 'Images', 'Course_Images', 'TAP_Courses_PNG_FIles');

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function buildImageMap() {
  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`Images directory not found: ${IMAGES_DIR}`);
  }
  const map = new Map();
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.png$/i.test(f));
  files.forEach(f => {
    const base = path.parse(f).name; // without extension
    const key = normalizeName(base);
    map.set(key, f);
  });
  return map;
}

function listCategoryPages() {
  const entries = fs.readdirSync(COURSES_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && /\.html$/i.test(e.name) && e.name !== 'course_template.html')
    .map(e => path.join(COURSES_DIR, e.name));
}

function updateFile(filePath, imageMap) {
  const relPrefix = path.join('..', 'Images', 'Course_Images', 'TAP_Courses_PNG_FIles').replace(/\\/g, '/');
  let html = fs.readFileSync(filePath, 'utf8');
  let replacedCount = 0;

  // Regex to find each feature-card tile, capture current img src and the title in <h3>
  const tileRe = new RegExp(
    // Match from the anchor link containing feature-card-link
    String.raw`(<a[^>]*class=\"feature-card-link\"[\s\S]*?<div class=\"feature-card\">[\s\S]*?<div class=\"feature-image\"[^>]*>[\s\S]*?<img[^>]*?src=\")(.*?)(\"[^>]*>[\s\S]*?<\/div>[\s\S]*?<h3>)([^<]+)(<\/h3>)`,
    'g'
  );

  html = html.replace(tileRe, (match, p1, src, p3, title, p5) => {
    const key = normalizeName(title);
    const file = imageMap.get(key);
    if (!file) {
      return match; // leave unchanged if no mapping
    }
    const newSrc = `${relPrefix}/${file}`;
    replacedCount++;
    return `${p1}${newSrc}${p3}${title}${p5}`;
  });

  if (replacedCount > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  return replacedCount;
}

function main() {
  const imageMap = buildImageMap();
  const files = listCategoryPages();
  let total = 0;
  files.forEach(fp => {
    const n = updateFile(fp, imageMap);
    if (n > 0) {
      console.log(`Updated ${n} tiles in ${path.relative(ROOT, fp)}`);
      total += n;
    }
  });
  console.log(`Done. Total tiles updated: ${total}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
