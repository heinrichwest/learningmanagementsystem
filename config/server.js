const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Serve TAP logo as favicon for all pages
    if (req.url === '/favicon.ico') {
        fs.readFile('../assets/images/logo/Logo.png', (error, content) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('favicon not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(content, 'binary');
        });
        return;
    }

    let filePath = '..' + req.url;
    if (filePath === '../') {
        filePath = '../index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        } else {
            if (contentType === 'text/html') {
                try {
                    let html = content.toString('utf-8');
                    const iconSnippet = '\n    <link rel="icon" type="image/png" href="/assets/images/logo/Logo.png">\n    <link rel="shortcut icon" type="image/png" href="/assets/images/logo/Logo.png">\n';
                    const scriptMarker = 'data-tap-strip-numbering';
                    const stripScript = '\n    <script id="tap-strip-numbering" ' + scriptMarker + '>\n    (function(){\n      function replaceText(node){\n        if(node.nodeType===3){\n          node.nodeValue = node.nodeValue.replace(/(^|\\\\s)\\\\d+\\\\.\\\\s+/g, "$1");\n          return;\n        }\n        var i=0, children=node.childNodes;\n        for(i=0;i<children.length;i++){ replaceText(children[i]); }\n      }\n      function run(){\n        if(!/\\\\bcourses\\\\b/i.test(location.pathname)) return;\n        var items = document.querySelectorAll("li");\n        for(var i=0;i<items.length;i++){ replaceText(items[i]); }\n      }\n      if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", run); } else { run(); }\n    })();\n    </script>\n';

                    let inject = '';
                    if (!html.includes('/assets/images/logo/Logo.png')) {
                        inject += iconSnippet;
                    }
                    if (!html.includes(scriptMarker)) {
                        inject += stripScript;
                    }
                    if (inject) {
                        if (html.includes('</head>')) {
                            html = html.replace('</head>', inject + '</head>');
                        } else if (html.match(/<head[^>]*>/i)) {
                            html = html.replace(/<head[^>]*>/i, (m) => m + inject);
                        } else if (html.includes('<html')) {
                            // Fallback: inject at top if head missing
                            html = inject + html;
                        }
                        content = Buffer.from(html, 'utf-8');
                    }
                } catch (e) {
                    // fall back to raw content on any injection error
                }
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, contentType === 'text/html' ? 'utf-8' : 'binary');
        }
    });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
