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
  console.log('[visitor-debug] request start', { method: req.method, url: req.url });
  console.log('[visitor-debug] headers', req.headers);
  try {
    if (req.method && req.method !== 'GET') {
      console.log('[visitor-debug] method not allowed');
      return createJSONResponse(res, 405, { error: 'Method not allowed' });
    }

    const cookies = parseCookies(req.headers?.cookie);
    const hasVisitorCookie = Boolean(cookies[COOKIE_NAME]);
    console.log('[visitor-debug] cookies present', { hasVisitorCookie, cookieKeys: Object.keys(cookies) });

    // Prefer Vercel KV when available and configured
    const kvEnvPresent = Boolean(
      process.env.VERCEL_KV_REST_URL ||
      process.env.VERCEL_KV_REST_TOKEN ||
      process.env.VERCEL_KV_URL ||
      process.env.VERCEL_KV_TOKEN ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.UPSTASH_REDIS_REST_TOKEN
    );
    console.log('[visitor-debug] kv client loaded', { kvExists: !!kv, kvEnvPresent });

    if (kv && kvEnvPresent) {
      console.log('[visitor-debug] using KV backend');
      try {
        if (!hasVisitorCookie) {
          const visitorId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
          const secureAttr = (req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') ? '; Secure' : '';
          res.setHeader('Set-Cookie', `${COOKIE_NAME}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secureAttr}`);
          console.log('[visitor-debug] set cookie for visitor', { visitorId });
          console.log('[visitor-debug] attempting KV incr visitors_total');
          const incrResult = await kv.incr('visitors_total');
          console.log('[visitor-debug] KV incr result', { incrResult });
        }

        console.log('[visitor-debug] attempting KV.get visitors_total');
        const val = await kv.get('visitors_total');
        console.log('[visitor-debug] KV.get result', { val });
        const count = Number(val) || 0;
        console.log('[visitor-debug] returning success', { count });
        return createJSONResponse(res, 200, { count, label: 'Total unique visitors' });
      } catch (err) {
        console.error('[visitor-debug] KV backend error', err && err.message ? err.message : err, err && err.stack ? err.stack : 'no-stack');
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        return createJSONResponse(res, 500, { message, stack });
      }
    }

    console.log('[visitor-debug] KV not configured; using local file fallback');
    try {
      const store = readLocalStore();
      console.log('[visitor-debug] local store read', { visitorsLength: Array.isArray(store.visitors) ? store.visitors.length : 'invalid' });
      const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      const ip = forwardedIp || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const fingerprint = crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');

      if (!Array.isArray(store.visitors)) store.visitors = [];
      if (!store.visitors.includes(fingerprint)) {
        store.visitors.push(fingerprint);
        console.log('[visitor-debug] adding fingerprint to local store', { fingerprint });
        try {
          writeLocalStore(store);
          console.log('[visitor-debug] local store written successfully');
        } catch (writeErr) {
          console.error('[visitor-debug] failed to write local store', writeErr && writeErr.message ? writeErr.message : writeErr, writeErr && writeErr.stack ? writeErr.stack : 'no-stack');
          const message = writeErr instanceof Error ? writeErr.message : String(writeErr);
          const stack = writeErr instanceof Error ? writeErr.stack : undefined;
          return createJSONResponse(res, 500, { message, stack });
        }
      }

      console.log('[visitor-debug] returning local count', { count: store.visitors.length });
      return createJSONResponse(res, 200, { count: store.visitors.length, label: 'Total unique visitors' });
    } catch (err) {
      console.error('[visitor-debug] local fallback error', err && err.message ? err.message : err, err && err.stack ? err.stack : 'no-stack');
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      return createJSONResponse(res, 500, { message, stack });
    }
  } catch (error) {
    console.error('[visitor-debug] unexpected error', error && error.message ? error.message : error, error && error.stack ? error.stack : 'no-stack');
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return createJSONResponse(res, 500, { message, stack });
  }
};
