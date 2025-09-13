// Fix individual course pages: remove Author accordion, clean artifacts, ensure unit reordering script
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'pages', 'courses', 'individual');

function removeAuthorAccordion(html) {
  let out = html;
  let guard = 0;
  while (true) {
    const m = out.match(/<h3[^>]*>\s*Author\s*:/i);
    if (!m) break;
    const titlePos = m.index;
    const start = out.lastIndexOf('<div class="accordion-item"', titlePos);
    if (start < 0) break;
    let i = start;
    let depth = 0;
    const len = out.length;
    while (i < len) {
      if (out.startsWith('<div', i)) { depth++; i += 4; continue; }
      if (out.startsWith('</div>', i)) { depth--; i += 6; if (depth === 0) break; continue; }
      i++;
    }
    const end = i;
    if (end > start) {
      out = out.slice(0, start) + out.slice(end);
    } else { break; }
    if (++guard > 1000) break;
  }
  return out;
}

function cleanArtifacts(html) {
  let out = html;
  out = out.replace(/`n/g, '\n');
  out = out.replace(/<script[^>]*src=\"[^\"]*restructure-course\.js\"[^>]*><\/script>/gi, '');
  out = out.replace(/<script[^>]*src=\"[^\"]*reorder-units\.js\"[^>]*><\/script>/gi, '');
  return out;
}

function ensureReorderInclude(html) {
  const include = '\n    <script src="../../../assets/js/reorder-units.js"></script>\n';
  return html.replace(/\s*<\/body>/i, include + '  </body>');
}

function processFile(fp) {
  const orig = fs.readFileSync(fp, 'utf8');
  let out = orig;
  out = removeAuthorAccordion(out);
  out = cleanArtifacts(out);
  out = ensureReorderInclude(out);
  if (out !== orig) {
    fs.writeFileSync(fp, out, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.html'));
  let changed = 0;
  files.forEach(f => {
    const fp = path.join(DIR, f);
    try {
      if (processFile(fp)) changed++;
    } catch (e) {
      console.error('Failed:', f, e.message);
    }
  });
  console.log('Processed', files.length, 'files. Updated', changed);
}

if (require.main === module) main();

