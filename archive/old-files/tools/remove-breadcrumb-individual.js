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

function removeBreadcrumb(html) {
  // Remove <section class="breadcrumb-section"> ... </section>
  // Be tolerant of attributes/spacing/newlines.
  const pattern = /<section\s+class=\"breadcrumb-section\"[\s\S]*?<\/section>\s*/gi;
  let modified = html.replace(pattern, '');

  // Also handle possible variant: <section class="breadcrumb"> ... </section>
  const pattern2 = /<section\s+class=\"breadcrumb\"[\s\S]*?<\/section>\s*/gi;
  modified = modified.replace(pattern2, '');

  return modified;
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
    const out = removeBreadcrumb(src);
    if (out !== src) {
      fs.writeFileSync(file, out, 'utf8');
      changed++;
      console.log('Updated:', path.relative(root, file));
    }
  }
  console.log(`Done. Updated ${changed} file(s).`);
}

if (require.main === module) main();

