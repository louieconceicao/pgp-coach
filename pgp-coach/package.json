const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../db');
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function requireHire(req, res, next) {
  if (!req.session.hireId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

const SECTIONS = [
  { key:'identity',    index:0, title:'Identity',    subtitle:'"Who Am I and Why Am I Here?"',  desc:'Discovering your why, values, and strengths' },
  { key:'vision',      index:1, title:'Vision',      subtitle:'"Where Am I Going?"',             desc:'Your 3-year vision, 12-month goals, and quarterly priorities' },
  { key:'system',      index:2, title:'System',      subtitle:'"How Will I Execute?"',           desc:'Weekly rhythm, scorecard, and accountability' },
  { key:'impact',      index:3, title:'Impact',      subtitle:'"How Will I Contribute?"',        desc:'Your contribution to the GTM Collective' },
  { key:'reflection',  index:4, title:'Reflection',  subtitle:'"What Am I Learning?"',           desc:'Quarterly reflection and annual growth review' },
  { key:'integration', index:5, title:'Integration', subtitle:'Building My Growth System',       desc:'Commitment and next steps' }
];

function buildSystemPrompt(section, hire) {
  const name = hire.first_name;
  const role = hire.role;
  const manager = hire.manager_name || 'their manager';
  const context = hire.context_notes ? `\n\nContext about ${name} provided by their manager: ${hire.context_notes}` : '';

  const guides = {
    identity: `Guide ${name} through Section 1: IDENTITY. Complete these three subsections in order:
1. THE WHY LADDER: Ask "why?" 5 times, each building on the last, to uncover their core motivation for joining GTM Collective
2. CORE VALUES MAP: Help them identify their top 5 from: Integrity, Accountability, Freedom, Excellence, Growth, Authenticity, Collaboration, Leadership, Empathy, Curiosity, Discipline, Respect, Impact, Innovation, Reliability, Balance, Transparency, Service, Courage, Resilience, Creativity, Gratitude, Honesty, Learning, Focus — and describe how each shows up in their daily work
3. STRENGTHS & EDGE ANALYSIS: Top 3 strengths, 2 development areas, and 1 superpower
After all three subsections are complete, summarize what was captured and ask if they're ready to finish this module.`,

    vision: `Guide ${name} through Section 2: VISION. Complete in order:
1. 3-YEAR VISION CANVAS: Help them write a vivid, present-tense description of their ideal professional life 3 years from now
2. ONE-MINUTE PLAN: 12-month goals across Revenue, Clients, Learning, Impact, and Personal
3. QUARTERLY ROCKS: 3-4 focus goals for each of Q1, Q2, Q3, Q4
After done, summarize and ask if ready to finish this module.`,

    system: `Guide ${name} through Section 3: SYSTEM. Complete in order:
1. WEEKLY OPERATING RHYTHM: How they'll structure Monday through Friday — a focus and notes for each day
2. PERSONAL SCORECARD: 5–7 weekly metrics they'll track to measure progress
3. ACCOUNTABILITY PARTNER: Who they'll partner with, meeting rhythm, and what they'll focus on together
After done, summarize and ask if ready to finish this module.`,

    impact: `Guide ${name} through Section 4: IMPACT. Complete in order:
1. COLLECTIVE IMPACT STATEMENT: The unique value they bring and specifically how they'll contribute
2. QUARTERLY CONTRIBUTION GOALS: How they'll contribute to the team in Q1, Q2, Q3, Q4
3. PATH TO PARTNERSHIP REFLECTION: Their honest thoughts on whether they're interested in a leadership/partnership path
After done, summarize and ask if ready to finish this module.`,

    reflection: `Guide ${name} through Section 5: REFLECTION. This is aspirational — they are a new hire setting up their future reflection practice, not reflecting on the past.
1. QUARTERLY REFLECTION SETUP: How they'll approach quarterly self-reflection — the questions they'll ask themselves
2. ANNUAL GROWTH REVIEW INTENTION: A forward-looking statement of who they intend to become and how they'll know they've grown
Frame everything as intention-setting. After done, summarize and ask if ready to finish this module.`,

    integration: `Guide ${name} through Section 6: INTEGRATION — the final module.
1. Walk through the Integration Checklist together: scheduling accountability sessions, sharing contribution goals with their pod, setting quarterly reflection reminders
2. Help them craft a personal COMMITMENT STATEMENT — their declaration of how they'll execute this plan
3. Celebrate their completion genuinely and warmly — they've done something meaningful here
4. Tell them their full PGP is about to be generated. Ask them to type "COMPLETE" to finalize everything.`
  };

  return `You are an expert professional growth coach with 15+ years of GTM experience. You are warm, encouraging, and use the Socratic method — asking one thoughtful question at a time, reflecting back what you hear, gently challenging surface-level answers, and celebrating progress.

You are coaching ${name} (${role}) through their GTM Collective Personal Growth Plan. Manager: ${manager}.${context}

CRITICAL COACHING RULES:
- Ask ONE question at a time. Never list multiple questions.
- After they respond, reflect back what you heard before asking the next question.
- If an answer is vague, probe deeper with "What would that look like day-to-day?" or "Why does that matter to you?"
- Keep your responses to 2–4 sentences plus one question.
- Be warm and human. Use ${name}'s name occasionally.
- When a subsection is complete, briefly confirm what you captured, then transition naturally to the next.
- This is a standalone module the hire can complete independently. Stay focused on this section only.

${guides[section.key]}

When the module is fully complete and the user confirms they're ready, end your message with exactly: [MODULE_COMPLETE]
When the user types "COMPLETE" in the Integration module, end your message with: [PLAN_COMPLETE]`;
}

// Get hire dashboard
router.get('/dashboard', requireHire, async (req, res) => {
  try {
    const hire = await pool.query('SELECT * FROM hires WHERE id = $1', [req.session.hireId]);
    const modules = await pool.query(
      'SELECT * FROM modules WHERE hire_id = $1 ORDER BY module_index', [req.session.hireId]
    );
    res.json({ hire: hire.rows[0], modules: modules.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get saved messages for a module
router.get('/modules/:moduleKey/messages', requireHire, async (req, res) => {
  try {
    const messages = await pool.query(
      `SELECT role, content, created_at FROM conversations
       WHERE hire_id=$1 AND module_key=$2 ORDER BY created_at`,
      [req.session.hireId, req.params.moduleKey]
    );
    const mod = await pool.query(
      'SELECT * FROM modules WHERE hire_id=$1 AND module_key=$2',
      [req.session.hireId, req.params.moduleKey]
    );
    res.json({ messages: messages.rows, module: mod.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat with coach
router.post('/modules/:moduleKey/chat', requireHire, async (req, res) => {
  const { message, isInit } = req.body;
  const moduleKey = req.params.moduleKey;
  const hireId = req.session.hireId;

  try {
    const hireResult = await pool.query('SELECT * FROM hires WHERE id = $1', [hireId]);
    const hire = hireResult.rows[0];
    const section = SECTIONS.find(s => s.key === moduleKey);
    if (!section) return res.status(400).json({ error: 'Invalid module' });

    // Check module is accessible
    const modResult = await pool.query(
      'SELECT * FROM modules WHERE hire_id=$1 AND module_key=$2', [hireId, moduleKey]
    );
    const mod = modResult.rows[0];
    if (!mod || mod.status === 'locked') {
      return res.status(403).json({ error: 'Module is locked. Complete previous modules first.' });
    }

    // Mark in_progress
    await pool.query(
      `UPDATE modules SET status = CASE WHEN status='unlocked' THEN 'in_progress' ELSE status END,
       started_at = COALESCE(started_at, NOW()) WHERE hire_id=$1 AND module_key=$2`,
      [hireId, moduleKey]
    );
    await pool.query(
      `UPDATE hires SET last_active_at=NOW(),
       status=CASE WHEN status='not_started' THEN 'in_progress' ELSE status END WHERE id=$1`,
      [hireId]
    );

    // Load full conversation history
    const history = await pool.query(
      'SELECT role, content FROM conversations WHERE hire_id=$1 AND module_key=$2 ORDER BY created_at',
      [hireId, moduleKey]
    );
    let messages = history.rows.map(r => ({ role: r.role, content: r.content }));

    if (isInit && messages.length === 0) {
      // First time opening this module — generate opening message
      const doneModules = await pool.query(
        `SELECT module_key FROM modules WHERE hire_id=$1 AND status='complete'`, [hireId]
      );
      const doneKeys = doneModules.rows.map(r => r.module_key);
      const initPrompt = section.index === 0
        ? `Warmly welcome ${hire.first_name} to the GTM Collective and their PGP coaching session. Let them know there are 6 modules they can complete at their own pace. Start Module 1 now — ask the first Why Ladder question. One question only, warm and human.`
        : `${hire.first_name} is starting Module ${section.index + 1}: ${section.title}. ${doneKeys.length > 0 ? `They've already completed: ${doneKeys.join(', ')}.` : ''} Briefly introduce this module in one sentence and ask your opening question. One question only.`;
      messages = [{ role: 'user', content: initPrompt }];
    } else if (isInit && messages.length > 0) {
      // Returning to a module in progress — just load history, no new message
      return res.json({ text: null, resumed: true, messages: messages });
    } else {
      // Normal message — save user message first
      await pool.query(
        'INSERT INTO conversations (hire_id, module_key, role, content) VALUES ($1,$2,$3,$4)',
        [hireId, moduleKey, 'user', message]
      );
      messages.push({ role: 'user', content: message });
    }

    // Call Claude
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: buildSystemPrompt(section, hire),
      messages
    });

    const text = response.content[0].text;

    // Save assistant message
    await pool.query(
      'INSERT INTO conversations (hire_id, module_key, role, content) VALUES ($1,$2,$3,$4)',
      [hireId, moduleKey, 'assistant', text]
    );

    // Handle module complete
    if (text.includes('[MODULE_COMPLETE]')) {
      await pool.query(
        `UPDATE modules SET status='complete', completed_at=NOW() WHERE hire_id=$1 AND module_key=$2`,
        [hireId, moduleKey]
      );
      // Unlock next module
      if (section.index < 5) {
        await pool.query(
          `UPDATE modules SET status='unlocked' WHERE hire_id=$1 AND module_index=$2 AND status='locked'`,
          [hireId, section.index + 1]
        );
      }
      return res.json({ text: text.replace('[MODULE_COMPLETE]', '').trim(), event: 'module_complete' });
    }

    // Handle plan complete
    if (text.includes('[PLAN_COMPLETE]')) {
      await pool.query(
        `UPDATE modules SET status='complete', completed_at=NOW() WHERE hire_id=$1 AND module_key=$2`,
        [hireId, moduleKey]
      );
      await pool.query(
        `UPDATE hires SET status='complete', completed_at=NOW() WHERE id=$1`, [hireId]
      );
      // Kick off plan generation async
      generateAndSavePlan(hireId, hire).catch(console.error);
      return res.json({ text: text.replace('[PLAN_COMPLETE]', '').trim(), event: 'plan_complete' });
    }

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Poll for completed plan
router.get('/plan', requireHire, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plans WHERE hire_id=$1', [req.session.hireId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function generateAndSavePlan(hireId, hire) {
  const allConvos = await pool.query(
    `SELECT module_key, role, content FROM conversations WHERE hire_id=$1 ORDER BY created_at`,
    [hireId]
  );
  const summary = allConvos.rows
    .filter(r => r.role === 'user')
    .map(r => `[${r.module_key}] ${r.content}`)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Write a complete, professional GTM Collective Personal Growth Plan document for ${hire.first_name} ${hire.last_name} (${hire.role}).
Start date: ${hire.start_date || 'recent'} | Manager: ${hire.manager_name || 'TBD'}

Based entirely on their coaching session responses below:
${summary}

Structure the document with these sections:
1. IDENTITY — Core Why Statement, Top 5 Values with descriptions, Strengths, Development Areas, Superpower
2. VISION — 3-Year Vision, 12-Month Goals table, Quarterly Rocks
3. SYSTEM — Weekly Operating Rhythm, Personal Scorecard metrics, Accountability Partner
4. IMPACT — Collective Impact Statement, Quarterly Contribution Goals, Partnership Path Reflection
5. REFLECTION — Quarterly Reflection Practice, Annual Growth Intention
6. COMMITMENT — Personal Commitment Statement, date

Write in first person from ${hire.first_name}'s perspective. Be specific, professional, and use their actual words where possible. This document will be shared with their manager.`
    }]
  });

  const content = response.content[0].text;
  await pool.query(
    `INSERT INTO plans (hire_id, content) VALUES ($1,$2)
     ON CONFLICT (hire_id) DO UPDATE SET content=$2, generated_at=NOW()`,
    [hireId, content]
  );
}

module.exports = router;
