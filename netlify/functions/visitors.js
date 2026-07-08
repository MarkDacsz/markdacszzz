const crypto = require('crypto');
const { connectLambda, getStore } = require('@netlify/blobs');

const GIST_ID = process.env.VISITOR_GIST_ID;
const GITHUB_TOKEN = process.env.VISITOR_GITHUB_TOKEN;
const GIST_FILE = process.env.VISITOR_GIST_FILE || 'visitor-counter.json';
const BLOBS_STORE = process.env.VISITOR_BLOBS_STORE || 'visitor-counter';
const BLOBS_KEY = process.env.VISITOR_BLOBS_KEY || 'visitor-counter.json';
const USE_GIST = Boolean(GIST_ID && GITHUB_TOKEN);

function normalizeStore(store) {
  return {
    visitors: Array.isArray(store?.visitors) ? store.visitors : [],
  };
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  try {
    return { status: response.status, data: text ? JSON.parse(text) : null };
  } catch (error) {
    throw new Error(`Invalid JSON response from ${url}: ${error.message}`);
  }
}

async function getGistStore() {
  if (!USE_GIST) return null;

  const url = `https://api.github.com/gists/${GIST_ID}`;
  const { status, data } = await fetchJson(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'visitor-counter-netlify-function',
    },
  });

  if (status !== 200) {
    throw new Error(`GitHub Gist fetch failed with status ${status}`);
  }

  const file = data.files?.[GIST_FILE] || Object.values(data.files || {})[0];
  if (!file?.content) {
    return { visitors: [] };
  }

  try {
    return normalizeStore(JSON.parse(file.content));
  } catch (error) {
    throw new Error(`Unable to parse gist file content: ${error.message}`);
  }
}

async function saveGistStore(store) {
  if (!USE_GIST) return;

  const url = `https://api.github.com/gists/${GIST_ID}`;
  const body = JSON.stringify({
    files: {
      [GIST_FILE]: {
        content: JSON.stringify(store, null, 2),
      },
    },
  });

  const { status } = await fetchJson(url, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'visitor-counter-netlify-function',
      'Content-Type': 'application/json',
    },
    body,
  });

  if (![200, 201].includes(status)) {
    throw new Error(`GitHub Gist write failed with status ${status}`);
  }
}

function getBlobStore() {
  return getStore(BLOBS_STORE);
}

async function readStore() {
  try {
    const data = await getBlobStore().get(BLOBS_KEY, { type: 'json' });
    return normalizeStore(data);
  } catch (error) {
    console.error('Netlify Blobs load failed:', error.message);
  }

  if (USE_GIST) {
    try {
      return await getGistStore();
    } catch (error) {
      console.error('GitHub gist load failed:', error.message);
    }
  }

  return { visitors: [] };
}

async function writeStore(store) {
  try {
    await getBlobStore().setJSON(BLOBS_KEY, normalizeStore(store));
    return;
  } catch (error) {
    console.error('Netlify Blobs save failed:', error.message);
  }

  if (USE_GIST) {
    try {
      await saveGistStore(store);
      return;
    } catch (error) {
      console.error('GitHub gist save failed:', error.message);
    }
  }

  throw new Error('Unable to persist visitor store');
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

exports.handler = async function (event) {
  try {
    connectLambda(event);

    const store = normalizeStore(await readStore());
    const fingerprint = getVisitorFingerprint(event);

    if (!store.visitors.includes(fingerprint)) {
      store.visitors.push(fingerprint);
      await writeStore(store);
    }

    return createResponse(200, {
      count: store.visitors.length,
      label: 'Total unique visitors',
    });
  } catch (error) {
    console.error('Visitor counter failed:', error.message);
    return createResponse(503, {
      error: 'Visitor count unavailable',
      label: 'Visitor count unavailable',
    });
  }
};
