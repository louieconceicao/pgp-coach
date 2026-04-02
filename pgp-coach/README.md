# GTM Collective — PGP Coach

An AI-powered coaching app that guides new hires through their Personal Growth Plan.

## Setup (2 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Anthropic API key
```bash
# Mac/Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows (Command Prompt)
set ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start the server
```bash
node server.js
```

### 4. Open the app
Visit: http://localhost:3000

---

## Deploying to production

### Option A — Railway (easiest, free tier)
1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
4. Done — Railway gives you a public URL

### Option B — Render
1. Push to GitHub
2. render.com → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add `ANTHROPIC_API_KEY` in environment variables

### Option C — Any VPS (DigitalOcean, AWS, etc.)
```bash
# On your server
git clone <your-repo>
cd pgp-coach
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js
```

---

## How it works
- `server.js` — Express server that proxies calls to the Anthropic API (keeps your API key secure)
- `public/index.html` — The full coaching app UI
- The AI coach guides new hires through all 6 PGP sections conversationally
- At the end, generates a formatted plan document they can download
