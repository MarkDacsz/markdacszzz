const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'visitor-counter.json');
const BUILD_DIR = path.join(__dirname, 'build');

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : undefined,
    methods: ['GET'],
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use('/api', limiter);

function readStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { month: null, visitors: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getVisitorFingerprint(req) {
  const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
  const ip = forwardedIp || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

function normalizeStore(store) {
  return {
    month: store?.month || null,
    visitors: Array.isArray(store?.visitors) ? store.visitors : [],
  };
}

app.get('/api/visitors', (req, res) => {
  const currentMonth = getMonthKey();
  const store = normalizeStore(readStore());

  if (store.month !== currentMonth) {
    store.month = currentMonth;
    store.visitors = [];
  }

  const fingerprint = getVisitorFingerprint(req);
  if (!store.visitors.includes(fingerprint)) {
    store.visitors.push(fingerprint);
    writeStore(store);
  }

  res.json({
    count: store.visitors.length,
    month: currentMonth,
    monthLabel: new Date().toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (process.env.NODE_ENV === 'production' && fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Visitor counter API running on port ${PORT}`);
});
