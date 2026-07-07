const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GIST_ID = process.env.VISITOR_GIST_ID;
const GITHUB_TOKEN = process.env.VISITOR_GITHUB_TOKEN;
const GIST_FILE = process.env.VISITOR_GIST_FILE || 'visitor-counter.json';

const fallbackStorePath = fs.existsSync('/tmp')
  ? path.join('/tmp', 'visitor-counter.json')
  : path.join(__dirname, '..', '..', 'data', 'visitor-counter.json');

const STORAGE_PATH = process.env.VISITOR_STORE || fallbackStorePath;
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

function readLocalStore() {
  try {
    const raw = fs.readFileSync(STORAGE_PATH, 'utf8');
    return normalizeStore(JSON.parse(raw));
  } catch (error) {
    return { visitors: [] };
  }
}

function writeLocalStore(store) {
  try {
    fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (error) {
    console.error('Unable to persist visitor store locally:', error.message);
  }
}

async function readStore() {
  if (USE_GIST) {
    try {
      return await getGistStore();
    } catch (error) {
      console.error('GitHub gist load failed:', error.message);
    }
  }

  return readLocalStore();
}

async function writeStore(store) {
  if (USE_GIST) {
    try {
      await saveGistStore(store);
      return;
    } catch (error) {
      console.error('GitHub gist save failed:', error.message);
    }
  }

  writeLocalStore(store);
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
