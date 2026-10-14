const crypto = require('crypto');

// In-memory session store
const sessions = new Map();

function getSession(req, res) {
  let sessionId = req.headers['x-session-id'] || req.query.sessionId;
  
  if (!sessionId && req.headers.cookie) {
    const match = req.headers.cookie.match(/ctf_session=([a-zA-Z0-9_-]+)/);
    if (match) sessionId = match[1];
  }

  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      id: sessionId,
      createdAt: Date.now(),
      solved: {}, // { [level]: { timestamp, points } }
      hintsUnlocked: {}, // { [level]: [hintId, ...] }
      penalties: 0,
      attempts: {}, // { [level]: count }
      rateLimitWindow: { start: Date.now(), count: 0 }
    });
  }

  res.setHeader('Set-Cookie', `ctf_session=${sessionId}; Path=/; SameSite=Lax; HttpOnly`);
  return sessions.get(sessionId);
}

function computeSessionScore(session) {
  let score = 0;
  for (const level in session.solved) {
    score += session.solved[level].points;
  }
  score -= (session.penalties || 0);
  return Math.max(0, score);
}

function checkRateLimit(session) {
  const now = Date.now();
  if (now - session.rateLimitWindow.start > 20000) {
    session.rateLimitWindow = { start: now, count: 0 };
  }
  session.rateLimitWindow.count++;
  return session.rateLimitWindow.count <= 15;
}

module.exports = {
  sessions,
  getSession,
  computeSessionScore,
  checkRateLimit
};
