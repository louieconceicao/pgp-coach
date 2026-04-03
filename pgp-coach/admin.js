<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GTM Collective · PGP Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --navy:#0d1333; --indigo:#3730a3; --violet:#5b4cf5; --blue:#6c8ef7;
    --cyan:#38bdf8; --white:#f8f9ff; --muted:#8b92b8;
    --border:rgba(255,255,255,0.08); --user-bubble:rgba(91,76,245,0.25);
    --coach-bubble:rgba(255,255,255,0.05);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:var(--navy);color:var(--white);height:100vh;display:flex;flex-direction:column;overflow:hidden}
  body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 60% 50% at 80% 10%,rgba(91,76,245,0.18) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 10% 90%,rgba(56,189,248,0.1) 0%,transparent 60%),linear-gradient(160deg,#0d1333 0%,#0a0f28 100%);pointer-events:none;z-index:0}
  #app{position:relative;z-index:1;display:flex;flex-direction:column;height:100vh}

  /* HEADER */
  header{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid var(--border);background:rgba(13,19,51,0.8);backdrop-filter:blur(12px);flex-shrink:0}
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;letter-spacing:0.1em;text-transform:uppercase}
  .logo span{color:var(--cyan)}
  .header-right{display:flex;align-items:center;gap:16px}
  .hire-info{font-size:12px;color:var(--muted)}
  .hire-info strong{color:var(--white)}
  .btn-link{background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color 0.2s}
  .btn-link:hover{color:var(--white)}

  /* LOGIN SCREEN */
  #login-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 24px;text-align:center}
  .badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;border:1px solid rgba(91,76,245,0.4);background:rgba(91,76,245,0.1);font-size:12px;color:var(--blue);font-weight:500;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:28px}
  .badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  #login-screen h1{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,48px);font-weight:800;line-height:1.1;margin-bottom:16px;background:linear-gradient(135deg,#fff 30%,var(--cyan) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  #login-screen p{font-size:15px;color:var(--muted);max-width:400px;line-height:1.7;margin-bottom:40px;font-weight:300}
  .login-form{display:flex;flex-direction:column;gap:14px;width:100%;max-width:340px}
  .field{display:flex;flex-direction:column;gap:6px;text-align:left}
  .field label{font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted)}
  .field input{background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:10px;padding:14px 18px;color:var(--white);font-family:'DM Sans',sans-serif;font-size:16px;outline:none;transition:border-color 0.2s;letter-spacing:0.2em;text-align:center}
  .field input:focus{border-color:var(--violet)}
  .field input::placeholder{color:rgba(255,255,255,0.2);letter-spacing:normal}
  .btn-primary{padding:16px;background:linear-gradient(135deg,var(--violet),var(--indigo));border:none;border-radius:12px;color:#fff;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(91,76,245,0.4)}
  .error-msg{font-size:13px;color:#f87171;text-align:center;display:none}

  /* DASHBOARD */
  #dashboard{display:none;flex-direction:column;flex:1;overflow:hidden}
  .dashboard-header{padding:24px 28px 0;flex-shrink:0}
  .dashboard-header h2{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;margin-bottom:4px}
  .dashboard-header p{font-size:13px;color:var(--muted)}
  .modules-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:24px 28px;overflow-y:auto;flex:1}
  .module-card{background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
  .module-card:hover:not(.locked){border-color:rgba(91,76,245,0.4);transform:translateY(-2px);box-shadow:0 8px 32px rgba(91,76,245,0.15)}
  .module-card.locked{opacity:0.4;cursor:not-allowed}
  .module-card.complete{border-color:rgba(56,189,248,0.3);background:rgba(56,189,248,0.04)}
  .module-card.active{border-color:rgba(91,76,245,0.5);background:rgba(91,76,245,0.08)}
  .module-num{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--cyan);margin-bottom:8px}
  .module-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:4px}
  .module-subtitle{font-size:12px;color:var(--muted);margin-bottom:16px}
  .module-status{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;padding:4px 10px;border-radius:100px}
  .status-locked{background:rgba(255,255,255,0.06);color:var(--muted)}
  .status-unlocked{background:rgba(91,76,245,0.15);color:var(--blue)}
  .status-in_progress{background:rgba(251,191,36,0.15);color:#fbbf24}
  .status-complete{background:rgba(56,189,248,0.15);color:var(--cyan)}
  .module-card.complete::after{content:'✓';position:absolute;top:16px;right:16px;font-size:16px;color:var(--cyan)}

  /* CHAT */
  #chat-interface{display:none;flex-direction:column;flex:1;overflow:hidden}
  #section-banner{padding:12px 28px;border-bottom:1px solid var(--border);background:rgba(91,76,245,0.08);flex-shrink:0;display:flex;align-items:center;justify-content:space-between}
  .section-info .section-num{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:var(--cyan);letter-spacing:0.1em;text-transform:uppercase}
  .section-info .section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700}
  .section-info .section-subtitle{font-size:11px;color:var(--muted);margin-top:2px}
  .btn-back{background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--muted);font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif}
  .btn-back:hover{background:rgba(255,255,255,0.1);color:var(--white)}
  #messages{flex:1;overflow-y:auto;padding:28px;display:flex;flex-direction:column;gap:16px;scroll-behavior:smooth}
  #messages::-webkit-scrollbar{width:4px}
  #messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
  .msg{display:flex;gap:12px;max-width:720px;animation:fadeUp 0.3s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .msg.user{align-self:flex-end;flex-direction:row-reverse}
  .msg.coach{align-self:flex-start}
  .avatar{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;font-weight:700}
  .avatar.coach-av{background:linear-gradient(135deg,var(--violet),var(--indigo))}
  .avatar.user-av{background:rgba(255,255,255,0.1);font-size:12px;color:var(--muted)}
  .bubble{padding:14px 18px;border-radius:16px;font-size:14px;line-height:1.7;max-width:580px}
  .msg.coach .bubble{background:var(--coach-bubble);border:1px solid var(--border);border-top-left-radius:4px;color:rgba(255,255,255,0.88)}
  .msg.user .bubble{background:var(--user-bubble);border:1px solid rgba(91,76,245,0.3);border-top-right-radius:4px;color:var(--white)}
  .typing-indicator{display:flex;gap:4px;align-items:center;padding:6px 4px}
  .typing-indicator span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:bounce 1.4s infinite ease-in-out}
  .typing-indicator span:nth-child(2){animation-delay:.16s}.typing-indicator span:nth-child(3){animation-delay:.32s}
  @keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}
  #input-area{padding:16px 28px 20px;border-top:1px solid var(--border);background:rgba(13,19,51,0.9);backdrop-filter:blur(12px);flex-shrink:0}
  .input-row{display:flex;gap:10px;align-items:flex-end}
  #user-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:14px;padding:13px 18px;color:var(--white);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;resize:none;max-height:140px;min-height:48px;line-height:1.5;transition:border-color 0.2s;overflow-y:auto}
  #user-input:focus{border-color:rgba(91,76,245,0.5)}
  #user-input::placeholder{color:rgba(255,255,255,0.2)}
  #send-btn{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--violet),var(--indigo));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}
  #send-btn:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(91,76,245,0.4)}
  #send-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  #send-btn svg{width:18px;height:18px;fill:white}
  .input-hint{font-size:11px;color:var(--muted);margin-top:8px;text-align:center}

  /* COMPLETE SCREEN */
  #complete-screen{display:none;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 24px;text-align:center}
  .complete-icon{width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,var(--violet),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:28px}
  #complete-screen h2{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;margin-bottom:12px;background:linear-gradient(135deg,#fff,var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  #complete-screen p{color:var(--muted);font-size:15px;max-width:440px;line-height:1.7;margin-bottom:12px}
  .generating-note{font-size:13px;color:var(--blue);margin-bottom:32px}
</style>
</head>
<body>
<div id="app">
  <header>
    <div class="logo">TEAM<span>REVENUE</span></div>
    <div class="header-right">
      <div class="hire-info" id="hire-info-header"></div>
      <button class="btn-link" id="logout-btn" style="display:none" onclick="logout()">Sign out</button>
    </div>
  </header>

  <!-- LOGIN -->
  <div id="login-screen">
    <div class="badge">AI-Powered PGP Coach</div>
    <h1>Welcome to Your Growth Plan</h1>
    <p>Enter the PIN your manager provided to access your Personal Growth Plan coaching session.</p>
    <div class="login-form">
      <div class="field">
        <label>Your PIN</label>
        <input type="text" id="pin-input" placeholder="000000" maxlength="6" onkeydown="if(event.key==='Enter')loginWithPIN()" />
      </div>
      <button class="btn-primary" onclick="loginWithPIN()">Access My PGP →</button>
      <div class="error-msg" id="login-error">Invalid PIN. Please check with your manager.</div>
    </div>
  </div>

  <!-- DASHBOARD -->
  <div id="dashboard">
    <div class="dashboard-header">
      <h2 id="dash-greeting">Welcome back!</h2>
      <p id="dash-subtitle">Complete each module at your own pace. Your progress is saved automatically.</p>
    </div>
    <div class="modules-grid" id="modules-grid"></div>
  </div>

  <!-- CHAT -->
  <div id="chat-interface">
    <div id="section-banner">
      <div class="section-info">
        <div class="section-num" id="section-num"></div>
        <div class="section-title" id="section-title"></div>
        <div class="section-subtitle" id="section-subtitle"></div>
      </div>
      <button class="btn-back" onclick="backToDashboard()">← Back to Modules</button>
    </div>
    <div id="messages"></div>
    <div id="input-area">
      <div class="input-row">
        <textarea id="user-input" placeholder="Share your thoughts..." rows="1"
          onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
        <button id="send-btn" onclick="sendMessage()">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="input-hint">Press Enter to send · Shift+Enter for new line</div>
    </div>
  </div>

  <!-- COMPLETE -->
  <div id="complete-screen">
    <div class="complete-icon">🎯</div>
    <h2>Your PGP is Complete!</h2>
    <p>Congratulations — you've finished all 6 modules. Your Personal Growth Plan has been saved and your manager has been notified.</p>
    <p class="generating-note">Your plan is being finalized and stored in the admin portal.</p>
    <button class="btn-primary" style="max-width:240px" onclick="showDashboard()">Back to Dashboard</button>
  </div>
</div>

<script>
const SECTIONS = [
  { key:'identity',    index:0, num:'Module 1 of 6', title:'Identity',    subtitle:'"Who Am I and Why Am I Here?"',  desc:'Discovering your why, values, and strengths' },
  { key:'vision',      index:1, num:'Module 2 of 6', title:'Vision',      subtitle:'"Where Am I Going?"',            desc:'Your 3-year vision, 12-month goals, and priorities' },
  { key:'system',      index:2, num:'Module 3 of 6', title:'System',      subtitle:'"How Will I Execute?"',          desc:'Weekly rhythm, scorecard, and accountability' },
  { key:'impact',      index:3, num:'Module 4 of 6', title:'Impact',      subtitle:'"How Will I Contribute?"',       desc:'Your contribution to the GTM Collective' },
  { key:'reflection',  index:4, num:'Module 5 of 6', title:'Reflection',  subtitle:'"What Am I Learning?"',          desc:'Quarterly reflection and annual growth review' },
  { key:'integration', index:5, num:'Module 6 of 6', title:'Integration', subtitle:'Building My Growth System',      desc:'Commitment and next steps' }
];

let currentHire = null;
let currentModuleKey = null;
let isWaiting = false;

// ── AUTH ──
async function loginWithPIN() {
  const pin = document.getElementById('pin-input').value.trim();
  if (pin.length !== 6) return showError('Please enter your 6-digit PIN.');
  const err = document.getElementById('login-error');
  err.style.display = 'none';
  try {
    const res = await fetch('/api/auth/hire/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (!res.ok) { err.style.display = 'block'; return; }
    currentHire = data.hire;
    showDashboard();
  } catch (e) {
    err.style.display = 'block';
  }
}

function showError(msg) {
  const err = document.getElementById('login-error');
  err.textContent = msg;
  err.style.display = 'block';
}

async function logout() {
  await fetch('/api/auth/hire/logout', { method: 'POST' });
  currentHire = null;
  show('login-screen');
  document.getElementById('hire-info-header').innerHTML = '';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('pin-input').value = '';
}

// ── DASHBOARD ──
async function showDashboard() {
  show('dashboard');
  document.getElementById('logout-btn').style.display = 'block';
  try {
    const res = await fetch('/api/hire/dashboard');
    const data = await res.json();
    currentHire = data.hire;
    document.getElementById('hire-info-header').innerHTML =
      `<strong>${currentHire.first_name} ${currentHire.last_name}</strong> · ${currentHire.role}`;
    document.getElementById('dash-greeting').textContent =
      `Welcome${currentHire.status === 'not_started' ? '' : ' back'}, ${currentHire.first_name}!`;
    const complete = data.modules.filter(m => m.status === 'complete').length;
    document.getElementById('dash-subtitle').textContent = complete === 0
      ? 'Complete each module at your own pace. Your progress saves automatically.'
      : `${complete} of 6 modules complete. Keep going — you're doing great!`;
    renderModuleCards(data.modules);
  } catch (e) {
    console.error(e);
  }
}

function renderModuleCards(modules) {
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = '';
  modules.forEach(mod => {
    const section = SECTIONS.find(s => s.key === mod.module_key);
    const isLocked = mod.status === 'locked';
    const card = document.createElement('div');
    card.className = `module-card ${mod.status === 'locked' ? 'locked' : ''} ${mod.status === 'complete' ? 'complete' : ''} ${mod.status === 'in_progress' ? 'active' : ''}`;
    const statusLabels = { locked:'🔒 Locked', unlocked:'▶ Start', in_progress:'⟳ Continue', complete:'✓ Complete' };
    const statusClasses = { locked:'status-locked', unlocked:'status-unlocked', in_progress:'status-in_progress', complete:'status-complete' };
    card.innerHTML = `
      <div class="module-num">${section.num}</div>
      <div class="module-title">${section.title}</div>
      <div class="module-subtitle">${section.subtitle}</div>
      <span class="module-status ${statusClasses[mod.status]}">${statusLabels[mod.status]}</span>
    `;
    if (!isLocked && mod.status !== 'complete') {
      card.onclick = () => openModule(mod.module_key);
    } else if (mod.status === 'complete') {
      card.style.cursor = 'default';
    }
    grid.appendChild(card);
  });
}

// ── CHAT ──
async function openModule(moduleKey) {
  currentModuleKey = moduleKey;
  const section = SECTIONS.find(s => s.key === moduleKey);
  document.getElementById('section-num').textContent = section.num;
  document.getElementById('section-title').textContent = section.title;
  document.getElementById('section-subtitle').textContent = section.subtitle;
  document.getElementById('messages').innerHTML = '';
  show('chat-interface');

  // Load existing messages or start fresh
  const res = await fetch(`/api/hire/modules/${moduleKey}/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isInit: true })
  });
  const data = await res.json();

  if (data.resumed && data.messages) {
    // Restore conversation history
    data.messages.forEach(m => {
      if (m.role !== 'user' || !m.content.startsWith('Warmly welcome') && !m.content.startsWith(currentHire?.first_name + ' is starting')) {
        addMessage(m.role === 'assistant' ? 'coach' : 'user', m.content);
      }
    });
  } else if (data.text) {
    addMessage('coach', data.text);
  }
  document.getElementById('user-input').focus();
}

async function sendMessage() {
  if (isWaiting) return;
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = ''; autoResize(input);
  addMessage('user', text);

  isWaiting = true;
  document.getElementById('send-btn').disabled = true;
  showTyping();

  try {
    const res = await fetch(`/api/hire/modules/${currentModuleKey}/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, isInit: false })
    });
    const data = await res.json();
    removeTyping();

    if (data.event === 'module_complete') {
      addMessage('coach', data.text);
      setTimeout(showDashboard, 2000);
    } else if (data.event === 'plan_complete') {
      addMessage('coach', data.text);
      setTimeout(() => show('complete-screen'), 2000);
    } else {
      addMessage('coach', data.text);
    }
  } catch (e) {
    removeTyping();
    addMessage('coach', 'Connection issue — please try again.');
  }

  isWaiting = false;
  document.getElementById('send-btn').disabled = false;
  document.getElementById('user-input').focus();
}

function backToDashboard() { showDashboard(); }

// ── UI HELPERS ──
function show(id) {
  ['login-screen','dashboard','chat-interface','complete-screen'].forEach(s => {
    const el = document.getElementById(s);
    el.style.display = s === id ? (s === 'dashboard' || s === 'chat-interface' ? 'flex' : 'flex') : 'none';
  });
}

function addMessage(role, text) {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const av = role === 'coach' ? '🧠' : (currentHire?.first_name?.[0]?.toUpperCase() || '?');
  div.innerHTML = `<div class="avatar ${role}-av">${av}</div><div class="bubble">${fmt(text)}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function fmt(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
}

function showTyping() {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div'); div.className='msg coach'; div.id='typing-msg';
  div.innerHTML=`<div class="avatar coach-av">🧠</div><div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div); msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping() { const t=document.getElementById('typing-msg'); if(t) t.remove(); }
function handleKey(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }
function autoResize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,140)+'px'; }

// Check session on load
(async () => {
  const res = await fetch('/api/auth/session');
  const data = await res.json();
  if (data.type === 'hire') { showDashboard(); }
  else { show('login-screen'); }
})();
</script>
</body>
</html>
