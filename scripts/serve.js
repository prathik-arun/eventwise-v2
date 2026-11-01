'use strict';

/**
 * Tiny static file server for local development: `npm start`.
 * Not needed to use the app (index.html also works when opened directly),
 * but handy for trying it the way GitHub Pages serves it.
 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

/** @returns {string | null} the file to serve for `urlPath`, or null if it is outside the project */
function resolveFile(urlPath) {
  const relative = decodeURIComponent(urlPath.split('?')[0]);
  const file = path.join(ROOT, relative.endsWith('/') ? `${relative}index.html` : relative);
  return file.startsWith(ROOT + path.sep) ? file : null;
}

function handleRequest(request, response) {
  let file;
  try {
    file = resolveFile(request.url);
  } catch {
    file = null; // malformed URL encoding
  }

  fs.readFile(file ?? '', (error, content) => {
    if (!file || error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    response.end(content);
  });
}

http.createServer(handleRequest).listen(PORT, '127.0.0.1', () => {
  console.log(`Eventwise running at http://127.0.0.1:${PORT}`);
});
