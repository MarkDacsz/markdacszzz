const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '../../data/visitor-counter.json');

function readStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { visitors: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getVisitorFingerprint(req) {
  const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
  const ip = forwardedIp || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

exports.handler = async function (event) {
  const store = readStore();
  const fingerprint = getVisitorFingerprint(event);

  if (!store.visitors.includes(fingerprint)) {
    store.visitors.push(fingerprint);
    writeStore(store);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      count: store.visitors.length,
      label: 'Total unique visitors',
    }),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  };
};
