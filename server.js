const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT) || 8080;
const ROOT = path.resolve(__dirname);
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.otf':'font/otf', '.woff':'font/woff', '.woff2':'font/woff2', '.ico':'image/x-icon' };
const server = http.createServer((req, res) => {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, { Allow:'GET, HEAD' }); res.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end('Bad request'); return; }
    const file = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(ROOT + path.sep) || file.includes('\0')) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.stat(file, (error, stat) => {
        if (error || !stat.isFile()) { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Not found'); return; }
        const ext = path.extname(file).toLowerCase();
        const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
        const headers = { 'Content-Type':MIME[ext] || 'application/octet-stream', ETag:etag, 'Last-Modified':stat.mtime.toUTCString(), 'Cache-Control':/\.(html|css|js|json)$/.test(ext) ? 'no-cache' : 'public, max-age=3600', 'X-Content-Type-Options':'nosniff' };
        if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); res.end(); return; }
        res.writeHead(200, { ...headers, 'Content-Length':stat.size });
        if (req.method === 'HEAD') { res.end(); return; }
        const stream = fs.createReadStream(file);
        stream.on('error', () => res.destroy());
        res.on('close', () => stream.destroy());
        stream.pipe(res);
    });
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use.` : error.message); process.exitCode = 1; });
server.listen(PORT, () => console.log(`Bottega Design Studio local server running at http://localhost:${PORT}/`));
