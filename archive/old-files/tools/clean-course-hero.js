const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile() && p.toLowerCase().endsWith('.html')) acc.push(p);
  }
  return acc;
}

function cleanCourseHero(html) {
  let out = html;

  // For pages using the custom course-hero template
  out = out.replace(/<div\s+class=\"course-category\"[\s\S]*?<\/div>\s*/gi, '');
  out = out.replace(/<p\s+class=\"course-description\"[\s\S]*?<\/p>\s*/gi, '');
  out = out.replace(/<div\s+class=\"course-meta\"[\s\S]*?<\/div>\s*/gi, '');
  out = out.replace(/<div\s+class=\"course-actions\"[\s\S]*?<\/div>\s*/gi, '');
  out = out.replace(/<div\s+class=\"meta-item\"[\s\S]*?<\/div>\s*/gi, '');

  // For pages using the theme hero (py-8 py-md-10 text-center)
  // Remove standalone course-meta paragraphs within hero
  out = out.replace(/<p\s+class=\"course-meta[^\"]*\"[\s\S]*?<\/p>\s*/gi, '');
  // Remove video/play column
  out = out.replace(/<div\s+class=\"col-md-2[\s\S]*?btn-play[\s\S]*?<\/div>\s*/gi, '');
  // Remove right-side descriptive column inside hero
  out = out.replace(/<div\s+class=\"col-md-5\s+text-md-start\"[\s\S]*?<\/div>\s*/gi, '');

  // Tidy multiple blank lines
  out = out.replace(/\n{3,}/g, '\n\n');

  // Ensure page-scoped style to remove hero bottom padding and next section top padding
  if (/py-8\s+py-md-10\s+text-center/.test(out)) {
    // Upgrade existing marker style (if previously inserted without sibling rule)
    out = out.replace(
      /<style>\/\* collapse hero bottom spacing \*\/[^<]*<\/style>/i,
      '<style>/* collapse hero bottom spacing */ .py-8.py-md-10.text-center{padding-bottom:0!important} .py-8.py-md-10.text-center+section.py-6{padding-top:0!important;margin-top:0!important} .py-8.py-md-10.text-center+section.py-6>*:first-child{margin-top:0!important}</style>'
    );
    // Inject if not present
    if (!/collapse hero bottom spacing/.test(out)) {
      out = out.replace(/<\/head>/i, `  <style>/* collapse hero bottom spacing */ .py-8.py-md-10.text-center{padding-bottom:0!important} .py-8.py-md-10.text-center+section.py-6{padding-top:0!important;margin-top:0!important} .py-8.py-md-10.text-center+section.py-6>*:first-child{margin-top:0!important}</style>\n</head>`);
    }
  }
  return out;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const targetDir = path.join(root, 'courses', 'individual');
  if (!fs.existsSync(targetDir)) {
    console.error('Target directory not found:', targetDir);
    process.exit(1);
  }
  const files = walk(targetDir);
  let changed = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const out = cleanCourseHero(src);
    if (out !== src) {
      fs.writeFileSync(file, out, 'utf8');
      console.log('Updated:', path.relative(root, file));
      changed++;
    }
  }
  console.log(`Done. Updated ${changed} file(s).`);
}

if (require.main === module) main();
