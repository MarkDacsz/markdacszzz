// Netlify Function to persist unique visitor fingerprints using Netlify Blobs
// Setup notes:
// - Enable Netlify Blobs for your site (Netlify UI).
// - Install the blobs client: `npm install @netlify/blobs`.
// - Optionally set `VISITOR_BLOBS_STORE` (store name) and `VISITOR_BLOBS_KEY` (blob key).
// This function uses Lambda compatibility mode; `connectLambda(event)` is called
// so environment-based configuration works inside Netlify Functions.

const crypto = require('crypto');
const { getStore, connectLambda } = require('@netlify/blobs');

const STORE_NAME = process.env.VISITOR_BLOBS_STORE || 'visitor-counter';
const BLOB_KEY = process.env.VISITOR_BLOBS_KEY || 'visitor-counter.json';

function normalizeStore(store) {
  return {
    visitors: Array.isArray(store?.visitors) ? store.visitors : [],
  };
}

function getVisitorFingerprint(event) {
  const headers = event.headers || {};
  const forwardedFor = headers['x-forwarded-for'] || headers['x-nf-client-connection-ip'];
  const ip = forwardedFor?.split(',')[0]?.trim() || headers['client-ip'] || 'unknown';
  const userAgent = headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  };
}

async function readStore(store) {
  try {
    const entry = await store.get(BLOB_KEY, { type: 'json' });
    return normalizeStore(entry || { visitors: [] });
  } catch (error) {
    // let caller handle logging / fallback
    throw error;
  }
}

async function writeStore(store, blobsStore) {
  try {
    await blobsStore.setJSON(BLOB_KEY, store);
  } catch (error) {
    throw error;
  }
}

exports.handler = async function (event) {
  try {
    // Ensure Lambda compatibility mode is initialized so getStore() reads
    // the correct environment-based configuration when running on Netlify.
    try {
      connectLambda && connectLambda(event);
    } catch (err) {
      // non-fatal — continue, getStore may still work with env vars
    }

    const blobsStore = getStore(STORE_NAME);

    const store = normalizeStore(await readStore(blobsStore));
    const fingerprint = getVisitorFingerprint(event);

    if (!store.visitors.includes(fingerprint)) {
      store.visitors.push(fingerprint);
      await writeStore(store, blobsStore);
    }

    return createResponse(200, {
      count: store.visitors.length,
      label: 'Total unique visitors',
    });
  } catch (error) {
    console.error('Visitor counter failed:', error && error.message ? error.message : error);
    return createResponse(503, {
      error: 'Visitor count unavailable',
      label: 'Visitor count unavailable',
    });
  }
};
