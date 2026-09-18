import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const r = Router();
const BATCH_SIZE = 5;
const RANDOM_USER_URL = process.env.USER_API_URL || 'https://randomuser.me/api/?results=5';

const tokenFor = (u) => jwt.sign(
  { id: u.id, email: u.email, name: u.name },
  process.env.JWT_SECRET || 'dev-secret',
  { expiresIn: '8h' },
);

function normalizeRemoteUser(u) {
  return {
    externalUuid: u.login?.uuid || null,
    name: [u.name?.first, u.name?.last].filter(Boolean).join(' ').trim() || 'Engineering Student',
    email: String(u.email || '').toLowerCase().trim(),
    avatarUrl: u.picture?.large || u.picture?.medium || u.picture?.thumbnail || '',
    city: u.location?.city || '',
    country: u.location?.country || '',
  };
}

async function countStoredUsers() {
  const [rows] = await db.execute('SELECT COUNT(*) AS count FROM users');
  return Number(rows[0]?.count || 0);
}

async function listStoredUsers() {
  const [users] = await db.execute(
    `SELECT id, name, email, external_uuid AS externalUuid, avatar_url AS avatarUrl, city, country
     FROM users
     ORDER BY created_at ASC, id ASC`,
  );
  return users;
}

async function fetchRemoteBatch() {
  const separator = RANDOM_USER_URL.includes('?') ? '&' : '?';
  const url = /[?&]results=/.test(RANDOM_USER_URL)
    ? RANDOM_USER_URL.replace(/([?&]results=)\d+/, `$1${BATCH_SIZE}`)
    : `${RANDOM_USER_URL}${separator}results=${BATCH_SIZE}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Random User API returned ${response.status}`);
  }

  const payload = await response.json();
  return (Array.isArray(payload?.results) ? payload.results : [])
    .slice(0, BATCH_SIZE)
    .map(normalizeRemoteUser)
    .filter((u) => u.email);
}

async function generateFiveUsers() {
  const createdUserIds = [];
  let attempts = 0;

  // Random User can occasionally return a user/email that is already stored.
  // Keep requesting batches until five NEW users have actually been persisted.
  while (createdUserIds.length < BATCH_SIZE && attempts < 5) {
    attempts += 1;
    const remoteUsers = await fetchRemoteBatch();

    for (const user of remoteUsers) {
      if (createdUserIds.length >= BATCH_SIZE) break;

      const [result] = await db.execute(
        `INSERT IGNORE INTO users
          (name, email, password_hash, external_uuid, avatar_url, city, country)
         VALUES (?, ?, NULL, ?, ?, ?, ?)`,
        [
          user.name,
          user.email,
          user.externalUuid,
          user.avatarUrl,
          user.city,
          user.country,
        ],
      );

      // affectedRows === 1 means this exact user was inserted into MySQL.
      if (result.affectedRows === 1) {
        createdUserIds.push(result.insertId);
      }
    }
  }

  if (createdUserIds.length === 0) {
    return [];
  }

  // Read the users back from MySQL before responding. This makes sure the
  // client only receives users that were successfully persisted in the DB.
  const placeholders = createdUserIds.map(() => '?').join(', ');
  const [createdUsers] = await db.execute(
    `SELECT id, name, email, external_uuid AS externalUuid, avatar_url AS avatarUrl, city, country
     FROM users
     WHERE id IN (${placeholders})
     ORDER BY created_at ASC, id ASC`,
    createdUserIds,
  );

  return createdUsers;
}

// On the very first load, generate the initial five users and persist them.
// On later loads, return what is already stored in MySQL. This also means any
// users added via "Generate 5 users" remain visible after a browser refresh.
r.get('/users', async (_req, res) => {
  try {
    if ((await countStoredUsers()) === 0) {
      await generateFiveUsers();
    }

    const users = await listStoredUsers();
    res.json({ users, pageSize: BATCH_SIZE, source: 'database' });
  } catch (error) {
    console.error('Learner profile load failed:', error);

    const users = await listStoredUsers().catch(() => []);
    res.status(users.length ? 200 : 500).json({
      users,
      pageSize: BATCH_SIZE,
      source: 'database',
      warning: users.length
        ? 'Unable to generate new learner profiles. Showing users already stored in MySQL.'
        : 'Unable to load learner profiles.',
    });
  }
});

// Generate five NEW Random User profiles and persist them in MySQL.
// The returned users are read back from the users table before being sent to
// the client, so the UI never appends non-persisted profiles.
r.post('/users/generate', async (_req, res) => {
  try {
    const users = await generateFiveUsers();

    res.json({
      users,
      addedCount: users.length,
      source: 'database',
      warning: users.length < BATCH_SIZE
        ? `Only ${users.length} new learner profile${users.length === 1 ? '' : 's'} could be generated and stored.`
        : '',
    });
  } catch (error) {
    console.error('Generating learner profiles failed:', error);
    res.status(502).json({
      message: 'Unable to generate and store five learner profiles right now.',
    });
  }
});

r.get('/avatar/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).end();

  const [rows] = await db.execute(
    'SELECT name, avatar_url AS avatarUrl FROM users WHERE id = ?',
    [id],
  );
  const user = rows[0];
  if (!user) return res.status(404).end();

  try {
    if (!user.avatarUrl) throw new Error('No avatar URL');

    const image = await fetch(user.avatarUrl, { cache: 'no-store' });
    if (!image.ok) throw new Error(`Avatar returned ${image.status}`);

    const contentType = image.headers.get('content-type') || 'image/jpeg';
    const bytes = Buffer.from(await image.arrayBuffer());
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(bytes);
  } catch (_error) {
    const initials = String(user.name || 'U')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'U';

    const safeInitials = initials.replace(/[<>&"']/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#EEF0FF"/><text x="64" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#5A69BD">${safeInitials}</text></svg>`;

    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'no-store');
    return res.send(svg);
  }
});

r.post('/select-user', async (req, res) => {
  const id = Number(req.body?.id);
  if (!id) {
    return res.status(400).json({ message: 'Select a user to continue.' });
  }

  const [rows] = await db.execute(
    `SELECT id, name, email, external_uuid AS externalUuid, avatar_url AS avatarUrl, city, country
     FROM users
     WHERE id = ?`,
    [id],
  );

  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'User not found. Reload the learner list.' });
  }

  res.json({ token: tokenFor(user), user });
});

r.get('/me', auth, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT id, name, email, external_uuid AS externalUuid, avatar_url AS avatarUrl, city, country
     FROM users
     WHERE id = ?`,
    [req.user.id],
  );

  res.json({ user: rows[0] || req.user });
});

export default r;
