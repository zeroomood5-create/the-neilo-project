import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

import { avatarApi } from './scripts/avatar-api.mjs';
const root = resolve(import.meta.dirname, 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp':'image/webp', '.mp4':'video/mp4', '.mp3':'audio/mpeg', '.json': 'application/json' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/api/avatar') return await avatarApi(request,response);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(Number(process.env.PORT || 4173), '0.0.0.0', function () { console.log('NEILO preview http://localhost:' + this.address().port); });
