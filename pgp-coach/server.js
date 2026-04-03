const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { initDB } = require('./db');

const app = express();

app.set('trust proxy', 1);
app.use(express.json());

// Simple signed cookie session — no extra packages needed
const SESSION_SECRET = process.env.SESSION_SECRET || 'pgp-coach-secret-change-in-prod';

function signData(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyData(token) {
  try {
    const [payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch { return null; }
}

const COOKIE_NAME = 'pgp_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Middleware: parse session from cookie
app.use((req, res, next) => {
  const raw = req.headers.cookie?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(COOKIE_NAME + '='))
    ?.slice(COOKIE_NAME.length + 1);

  req.session = raw ? (verifyData(decodeURIComponent(raw)) || {}) : {};

  res.setSession = (data) => {
    const token = signData(data);
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`
    );
  };

  res.clearSession = () => {
    res.setHeader('Set-Cookie',
      `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`
    );
  };

  next();
});

// Debug route
app.get('/api/debug/session', (req, res) => {
  res.json({ session: req.session });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hire', require('./routes/hire'));

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`GTM PGP Coach running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
