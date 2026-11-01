/**
 * Tiny static file server for local development: `npm start`.
 * It serves the modular source in `src/` (ES modules need a server, not
 * `file://`). The finished single-file page is the root `index.html`.
 */
import { readFile } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const PORT = Number(process.env.PORT) || 8080;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

/** @returns {string | null} the file to serve for `urlPath`, or null if it is outside `src/` */
function resolveFile(urlPath) {
  const relative = decodeURIComponent(urlPath.split('?')[0]);
  const file = path.join(ROOT, relative.endsWith('/') ? `${relative}index.html` : relative);
  return file.startsWith(ROOT + path.sep) ? file : null;
}

function safeResolve(urlPath) {
  try {
    return resolveFile(urlPath);
  } catch {
    return null; // malformed URL encoding
  }
}

function handleRequest(request, response) {
  const file = safeResolve(request.url);

  readFile(file ?? '', (error, content) => {
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

createServer(handleRequest).listen(PORT, '127.0.0.1', () => {
  console.log(`Eventwise (source) running at http://127.0.0.1:${PORT}`);
});
