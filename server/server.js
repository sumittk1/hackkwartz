const express = require('express');
const path = require('path');
const { CHALLENGES } = require('./challenges');
const { getSession, computeSessionScore, checkRateLimit } = require('./session');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Enable CORS for separately hosted challenge websites
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Get current player progress
app.get('/api/progress', (req, res) => {
  const session = getSession(req, res);
  const solvedList = Object.keys(session.solved).map(Number);
  const fragments = solvedList.map(lvl => CHALLENGES[lvl]?.fragment).filter(Boolean);
  const totalScore = computeSessionScore(session);

  res.json({
    sessionId: session.id,
    score: totalScore,
    totalPossible: 1000,
    solvedLevels: solvedList,
    fragmentsRecovered: fragments,
    fragmentCount: fragments.length,
    hintsUnlocked: session.hintsUnlocked,
    penalties: session.penalties
  });
});

// 2. Metadata for all challenges (NO flags leaked)
app.get('/api/challenges', (req, res) => {
  const session = getSession(req, res);
  const list = Object.values(CHALLENGES).map(c => ({
    level: c.level,
    id: c.id,
    title: c.title,
    artifact: c.artifact,
    skill: c.skill,
    points: c.points,
    epigraph: c.epigraph,
    learning: c.learning,
    isSolved: !!session.solved[c.level],
    hintsAvailable: c.hints.map(h => ({
      id: h.id,
      cost: h.cost,
      unlocked: (session.hintsUnlocked[c.level] || []).includes(h.id),
      text: (session.hintsUnlocked[c.level] || []).includes(h.id) ? h.text : undefined
    }))
  }));
  res.json({ challenges: list });
});

// 3. Unlock a hint with server-side point penalty
app.post('/api/hint', (req, res) => {
  const session = getSession(req, res);
  const challengeId = req.body.challengeId || req.body.level;
  const rawHintId = req.body.hintId;

  const challenge = CHALLENGES[challengeId];
  if (!challenge) {
    return res.status(404).json({ error: 'Unknown challenge' });
  }

  const numericHintId = typeof rawHintId === 'string' && rawHintId.startsWith('hint') 
    ? Number(rawHintId.replace('hint', '')) 
    : Number(rawHintId);

  const hint = challenge.hints.find(h => h.id === numericHintId) || challenge.hints[0];
  if (!hint) {
    return res.status(404).json({ error: 'Unknown hint ID' });
  }

  if (!session.hintsUnlocked[challenge.level]) {
    session.hintsUnlocked[challenge.level] = [];
  }

  const alreadyUnlocked = session.hintsUnlocked[challenge.level].includes(hint.id);
  if (!alreadyUnlocked) {
    session.hintsUnlocked[challenge.level].push(hint.id);
    session.penalties = (session.penalties || 0) + hint.cost;
  }

  res.json({
    success: true,
    hintId: hint.id,
    hintText: hint.text,
    hint: hint.text,
    cost: hint.cost,
    alreadyUnlocked,
    newScore: computeSessionScore(session),
    unlockedHints: session.hintsUnlocked[challenge.level]
  });
});

// 4. Server-Side Flag Submission & Validation
app.post('/api/submit', (req, res) => {
  const session = getSession(req, res);
  const challengeId = req.body.challengeId || req.body.level;
  const flag = req.body.flag;

  // Rate limiting check
  if (!checkRateLimit(session)) {
    return res.status(429).json({
      success: false,
      message: 'The Dark Archive wards are throttling rapid attempts. Wait a few moments before trying again.'
    });
  }

  // Input validation
  if (!challengeId || typeof flag !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid payload structure.' });
  }

  const trimmedFlag = flag.trim();
  if (trimmedFlag.length === 0 || trimmedFlag.length > 128) {
    return res.status(400).json({ success: false, message: 'Flag must be between 1 and 128 characters.' });
  }

  const challenge = CHALLENGES[challengeId];
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Unknown challenge specified.' });
  }

  // Track attempts
  session.attempts[challenge.level] = (session.attempts[challenge.level] || 0) + 1;

  // Verify Flag Server-Side (Case-Sensitive exact comparison)
  const isMatch = challenge.flags.includes(trimmedFlag);

  if (isMatch) {
    const alreadySolved = !!session.solved[challenge.level];
    if (!alreadySolved) {
      session.solved[challenge.level] = {
        timestamp: Date.now(),
        points: challenge.points
      };
    }

    const currentScore = computeSessionScore(session);
    const solvedCount = Object.keys(session.solved).length;

    return res.json({
      success: true,
      message: alreadySolved 
        ? 'Flag already verified! The memory shard remains secured.'
        : 'Correct! The ancient enchantment shatters. Memory fragment recovered!',
      alreadySolved,
      pointsAwarded: alreadySolved ? 0 : challenge.points,
      totalScore: currentScore,
      fragment: challenge.fragment,
      solvedCount,
      allSolved: solvedCount === 7,
      learning: challenge.learning
    });
  } else {
    // Pick an amusing troll/feedback message based on attempts
    const trollList = challenge.trollMessages;
    const trollIndex = (session.attempts[challenge.level] - 1) % trollList.length;
    const feedback = trollList[trollIndex] || 'Incorrect incantation. The seal holds firm.';

    return res.json({
      success: false,
      message: feedback,
      attempts: session.attempts[challenge.level]
    });
  }
});

// 5. Special Endpoint for Level 3: The Slytherin Locket (Network tab challenge)
app.get(['/api/level-3', '/api/archive/locket'], (req, res) => {
  res.json({
    artifact: 'Slytherin Locket',
    inscription: 'darr_ko_harao',
    message: 'The truth hides in the response.',
    reliquary: 'Salazar Slytherin Heirloom',
    status: 'sealed',
    cipher_type: 'parsel_frequency',
    memory: 'darr_ko_harao',
    epigraph: 'The truth. It is a beautiful and terrible thing.',
    transmission_timestamp: new Date().toISOString(),
    instruction: 'To unlock this fragment, wrap the inscription value in Hackwarts{...} and submit.'
  });
});

// 6. Reset session
app.post('/api/reset', (req, res) => {
  const session = getSession(req, res);
  session.solved = {};
  session.hintsUnlocked = {};
  session.penalties = 0;
  session.attempts = {};
  res.json({ success: true, message: 'Archive expedition reset successfully.' });
});

// -------------------------------------------------------------
// STATIC FILE SERVING & ROUTING FOR CHALLENGES
// -------------------------------------------------------------

// Serve static assets from hackkwartz-main
app.use(express.static(ROOT_DIR));

// Dedicated challenges directory (outside hackkwartz-main)
const CHALLENGES_DIR = path.join(ROOT_DIR, '..', 'challenges');
app.use('/challenges', express.static(CHALLENGES_DIR));

// Individual Challenge Dedicated Directories
app.use('/challenges/level1-diary', express.static(path.join(CHALLENGES_DIR, 'level1-diary')));
app.use('/challenges/level2-ring', express.static(path.join(CHALLENGES_DIR, 'level2-ring')));
app.use('/challenges/level3-locket', express.static(path.join(CHALLENGES_DIR, 'level3-locket')));
app.use('/challenges/level4-goblet', express.static(path.join(CHALLENGES_DIR, 'level4-goblet')));
app.use('/challenges/level5-diadem', express.static(path.join(CHALLENGES_DIR, 'level5-diadem')));
app.use('/challenges/level6-serpent', express.static(path.join(CHALLENGES_DIR, 'level6-serpent')));
app.use('/challenges/level7-final', express.static(path.join(CHALLENGES_DIR, 'level7-final')));

// Friendly Routes for Challenges
app.get('/challenge/1', (req, res) => res.redirect('https://level1ctfhackwartzs.vercel.app/'));
app.get('/challenge/2', (req, res) => res.redirect('https://level2ctfhackwartzsa.vercel.app/'));
app.get('/challenge/3', (req, res) => res.redirect('https://level3ctfhackwartzsah.vercel.app/'));
app.get('/challenge/4', (req, res) => res.redirect('https://github.com/sahil4love/Aap-Bhagwan-Ho/releases/download/1.0.0/goblet_clues.zip'));
app.get('/challenge/5', (req, res) => {
  const p = path.join(CHALLENGES_DIR, 'level5-diadem/index.html');
  if (require('fs').existsSync(p)) return res.sendFile(p);
  res.redirect('/#cardLevel5');
});
app.get('/challenge/6', (req, res) => res.redirect('https://github.com/sahil4love/Aap-Bhagwan-Ho/releases/download/1.0.0.1/serpent_archive.zip'));
app.get('/challenge/7', (req, res) => res.redirect('https://github.com/sahil4love/Aap-Bhagwan-Ho/releases/download/1.0.0.0/final.py'));


// Numbered alias routes (/level1, /level2, etc.)
for (let i = 1; i <= 7; i++) {
  app.get(`/level${i}`, (req, res) => res.redirect(`/challenge/${i}`));
  app.get(`/challenges/${i}`, (req, res) => res.redirect(`/challenge/${i}`));
}

// Dedicated CTF Page (Hackwarts Wizarding Theme)
app.get('/ctf', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'ctf.html'));
});
app.get('/ctf/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'ctf.html'));
});
app.get('/ctf.html', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'ctf.html'));
});

// Hub / Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` THE SEVEN HORCRUXES - WEB CTF SERVER RUNNING`);
  console.log(` Server active at: http://localhost:${PORT}`);
  console.log(` Flag Authentication: STRICTLY SERVER-SERVED & SECURE`);
  console.log(` Server Files Located in: /home/ausu/Desktop/CTF/hackkwartz-main/server/`);
  console.log(`=======================================================`);
});

module.exports = app;
