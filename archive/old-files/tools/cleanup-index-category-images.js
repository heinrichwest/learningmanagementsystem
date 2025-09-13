// Clean up and set home page category images to ./Images/Categories/<Category>.jpg
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

let html = fs.readFileSync(INDEX, 'utf8');

// Remove duplicate sequences from earlier bad replacements
html = html.replace(/src=\"\s*class=\"img-fluid rounded\"\s*src=\"/g, 'src="');

// Replace each tile's img src using the title text
const tileRe = /(<div class=\"hoverdir-item-content\"><a[^>]*>\s*)<img([^>]*?)src=\"[^\"]*\"([^>]*?)>([\s\S]*?<h3[^>]*>)([^<]+)(<\/h3>)/g;
html = html.replace(tileRe, (m, pre, attrsBefore, attrsAfter, between, title, h3close) => {
  const src = `./Images/Categories/${title}.jpg`;
  const imgTag = `${pre}<img${attrsBefore}src=\\\"${src}\\\"${attrsAfter}>`;
  return `${imgTag}${between}${title}${h3close}`;
});

fs.writeFileSync(INDEX, html, 'utf8');
console.log('index.html cleaned and category images set.');
