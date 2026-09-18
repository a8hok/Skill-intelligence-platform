import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const RANDOM_USER_URL = 'https://randomuser.me/api/?results=5';

function normalizeUser(user) {
  return {
    externalUuid: user.login?.uuid || null,
    name: [user.name?.first, user.name?.last].filter(Boolean).join(' '),
    email: String(user.email || '').toLowerCase(),
    avatarUrl: user.picture?.large || '',
    city: user.location?.city || '',
    country: user.location?.country || '',
  };
}

app.get('/api/users', async (_req, res) => {
  const [users] = await db.query(`
    SELECT id, name, email, avatar_url AS avatarUrl, city, country
    FROM users
    ORDER BY created_at ASC
  `);
  res.json({ users });
});

app.post('/api/users/generate', async (_req, res) => {
  try {
    const response = await fetch(RANDOM_USER_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Random User API returned ${response.status}`);

    const payload = await response.json();
    const users = (payload.results || []).map(normalizeUser).filter((u) => u.email);

    for (const user of users) {
      await db.execute(
        `INSERT IGNORE INTO users
         (external_uuid, name, email, avatar_url, city, country)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.externalUuid, user.name, user.email, user.avatarUrl, user.city, user.country],
      );
    }

    const [storedUsers] = await db.query(`
      SELECT id, name, email, avatar_url AS avatarUrl, city, country
      FROM users
      ORDER BY created_at ASC
    `);

    res.json({ users: storedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/topics', (_req, res) => {
  res.json({ topics: ['Databases', 'Web Development', 'OOP', 'DevOps', 'Design Systems'] });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
