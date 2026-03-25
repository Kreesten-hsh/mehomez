import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function safePath(urlPath) {
  const rawPath = urlPath === '/' ? '/mehomez-portfolio.html' : urlPath;
  const resolved = path.normalize(path.join(rootDir, rawPath));
  if (!resolved.startsWith(rootDir)) {
    return null;
  }
  return resolved;
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
    const filePath = safePath(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath);
    response.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    response.end(content);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(500);
    response.end(String(error));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server running on http://127.0.0.1:${port}`);
});
