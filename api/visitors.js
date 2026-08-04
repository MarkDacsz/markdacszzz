/*
  Vercel-compatible visitor counter API
  - Uses Vercel KV when available (recommended for production)
  - Falls back to a local file store only when KV is not configured (local dev via `server.js` handles /api/visitors)
  - Uses a cookie to deduplicate unique visitors per browser
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let kv = null;
try {
  kv = require('@vercel/kv').kv;
} catch (_e) {
  kv = null;
}

const COOKIE_NAME = 'vc_visitor_id';
const DATA_FILE = path.join(process.cwd(), 'data', 'visitor-counter.json');

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=');
    out[k] = decodeURIComponent(v.join('='));
  });
  return out;
}

function createJSONResponse(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function readLocalStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (_e) {
    return { visitors: [] };
  }
}

function writeLocalStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

module.exports = async function handler(req, res) {
  try {
    if (req.method && req.method !== 'GET') {
      return createJSONResponse(res, 405, { error: 'Method not allowed' });
    }

    const cookies = parseCookies(req.headers?.cookie);
    const hasVisitorCookie = Boolean(cookies[COOKIE_NAME]);

    // Prefer Vercel KV when available and configured
    const kvConfigured = kv && (process.env.VERCEL_KV_REST_URL || process.env.VERCEL_KV_REST_TOKEN || process.env.VERCEL_KV_URL || process.env.VERCEL_KV_TOKEN);

    if (kvConfigured) {
      // If no cookie, create one and increment the counter
      if (!hasVisitorCookie) {
        const visitorId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        const secureAttr = (req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') ? '; Secure' : '';
        // HttpOnly ensures JS cannot read it, but that's fine — we only need presence
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secureAttr}`);
        try {
          await kv.incr('visitors_total');
        } catch (err) {
          console.error('KV incr failed:', err && err.message ? err.message : err);
        }
      }

      let count = 0;
      try {
        const val = await kv.get('visitors_total');
        count = Number(val) || 0;
      } catch (err) {
        console.error('KV get failed:', err && err.message ? err.message : err);
      }

      return createJSONResponse(res, 200, { count, label: 'Total unique visitors' });
    }

    // Fallback: local file store (useful for running the Node server locally)
    const store = readLocalStore();
    // Use fingerprint based on IP+UA to avoid double counting if cookies are blocked
    const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    const ip = forwardedIp || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const fingerprint = crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');

    if (!store.visitors.includes(fingerprint)) {
      store.visitors.push(fingerprint);
      writeLocalStore(store);
    }

    return createJSONResponse(res, 200, { count: store.visitors.length, label: 'Total unique visitors' });
  } catch (error) {
    console.error('Visitor counter failed:', error && error.message ? error.message : error);
    return createJSONResponse(res, 503, { error: 'Visitor count unavailable', label: 'Visitor count unavailable' });
  }
};
