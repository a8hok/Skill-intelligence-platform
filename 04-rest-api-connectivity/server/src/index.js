import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/topics', (_req, res) => {
  res.json({
    topics: ['Databases', 'Web Development', 'OOP', 'DevOps', 'Design Systems'],
  });
});

app.get('/api/db-health', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS databaseTime');
    res.json({ status: 'ok', databaseTime: rows[0].databaseTime });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
