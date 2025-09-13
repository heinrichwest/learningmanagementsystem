// Update home page category images to use ./Images/Categories/<Category>.jpg
// Matches tiles in the #portfolio section and sets the <img src> based on the <h3> text.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

function replaceImages(html) {
  const imgTileRe = new RegExp(
    String.raw`(<div class=\"hoverdir-item-content\"><a[^>]*>\s*<img([^>]*?)src=\")(.*?)(\"([^>]*)>\s*<div class=\"hoverdir-text\">[\s\S]*?<h3[^>]*>)([^<]+)(<\/h3>)`,
    'g'
  );
  return html.replace(imgTileRe, (m, p1, preAttrs, oldSrc, postAttrs, beforeTitle, title, afterTitle) => {
    const fileName = `${title}.jpg`;
    const newSrc = `./Images/Categories/${fileName}`;
    return `${p1}${preAttrs}src="${newSrc}${postAttrs}${beforeTitle}${title}${afterTitle}`;
  });
}

function main() {
  const orig = fs.readFileSync(INDEX, 'utf8');
  const updated = replaceImages(orig);
  if (updated !== orig) {
    fs.writeFileSync(INDEX, updated, 'utf8');
    console.log('index.html: category image sources updated.');
  } else {
    console.log('index.html: no changes applied.');
  }
}

if (require.main === module) {
  main();
}

