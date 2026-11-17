// SafeLens local server: serves the static app and the /api/analyze backend.
// Zero dependencies. Requires Node 18+.  Usage:  npm start
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dotenv dependency)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
}

const { handleAnalyze } = require('./api/_lib');
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_BODY = 200 * 1024;
const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json'
};
// Never serve backend source or secrets
const BLOCKED = /^\/(\.env|\.git|api\/|server\.js|package(-lock)?\.json|node_modules)/i;

const send = (res, status, body, type) => {
    res.writeHead(status, { 'Content-Type': type || 'application/json' });
    res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);

    // Allow the app to be opened from another local dev server (e.g. VS Code Live Server on :5500)
    const origin = req.headers.origin || '';
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    if (url === '/api/health') return send(res, 200, { ok: true, ai: !!process.env.GROQ_API_KEY });

    if (url === '/api/analyze') {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
        let size = 0;
        const chunks = [];
        req.on('data', c => {
            size += c.length;
            if (size > MAX_BODY) { send(res, 413, { error: 'Payload too large' }); req.destroy(); }
            else chunks.push(c);
        });
        req.on('end', async () => {
            if (res.writableEnded) return;
            let body;
            try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
            catch (_) { return send(res, 400, { error: 'Invalid JSON' }); }
            const { status, json } = await handleAnalyze(body);
            send(res, status, json);
        });
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' });
    if (BLOCKED.test(url)) return send(res, 404, 'Not found', 'text/plain');

    const filePath = path.normalize(path.join(ROOT, url === '/' ? 'index.html' : url));
    if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden', 'text/plain');
    fs.readFile(filePath, (err, data) => {
        if (err) return send(res, 404, 'Not found', 'text/plain');
        send(res, 200, data, MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    });
}).listen(PORT, () => {
    console.log('SafeLens running at http://localhost:' + PORT);
    if (!process.env.GROQ_API_KEY) console.warn('Warning: GROQ_API_KEY not set - offline engine works, Deep AI scan will be disabled.');
});
