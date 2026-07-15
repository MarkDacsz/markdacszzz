const crypto = require('crypto');
const { get, put } = require('@vercel/blob');

const BLOB_PATH = process.env.VISITOR_BLOB_PATH || 'visitor-counter/visitor-counter.json';

// Same response shape as Netlify function
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify(body),
  };
}

function getVisitorFingerprint(event) {
  const headers = event?.headers || {};
  const getHeader = (name) => headers[name] || headers[name.toLowerCase()];

  // Try common proxy headers
  const forwardedFor = getHeader('x-forwarded-for') || getHeader('x-nf-client-connection-ip');
  const ip = forwardedFor?.split(',')?.[0]?.trim() || getHeader('client-ip') || 'unknown';
  const userAgent = getHeader('user-agent') || 'unknown';

  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

async function readStoreFromBlob() {
  const result = await get(BLOB_PATH, { access: 'private' });
  if (!result) {
    return { visitors: [] };
  }

  // result.blob.stream exists for @vercel/blob; read it fully
  const chunks = [];
  for await (const chunk of result.stream) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');

  const parsed = JSON.parse(raw || '{}');
  return {
    visitors: Array.isArray(parsed?.visitors) ? parsed.visitors : [],
  };
}

async function writeStoreToBlob(store) {
  await put(BLOB_PATH, JSON.stringify(store), {
    access: 'private',
    contentType: 'application/json',
  });
}

module.exports = async function handler(req, res) {
  try {
    // Basic method guard
    if (req.method && req.method !== 'GET') {
      const out = createResponse(405, { error: 'Method not allowed' });
      res.statusCode = out.statusCode;
      Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.end(out.body);
      return;
    }

    const store = await readStoreFromBlob();
    const fingerprint = getVisitorFingerprint({ headers: req.headers });

    if (!store.visitors.includes(fingerprint)) {
      store.visitors.push(fingerprint);
      await writeStoreToBlob(store);
    }

    const out = createResponse(200, {
      count: store.visitors.length,
      label: 'Total unique visitors',
    });

    res.statusCode = out.statusCode;
    Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.end(out.body);
  } catch (error) {
    // Graceful failure (frontend already handles this)
    console.error('Visitor counter failed:', error && error.message ? error.message : error);
    const out = createResponse(503, {
      error: 'Visitor count unavailable',
      label: 'Visitor count unavailable',
    });

    res.statusCode = out.statusCode;
    Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.end(out.body);
  }
};
