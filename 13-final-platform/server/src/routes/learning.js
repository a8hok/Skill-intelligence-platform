import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';
import { topics } from '../services/topics.js';
import { recommendNextTopic } from '../services/geminiService.js';

const r = Router();
r.use(auth);

function parseJson(value, fallback = []) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function topicStatus(history) {
  if (!history.length) return 'Not Started';
  const latest = Number(history[0].score || 0);
  const previous = history[1] ? Number(history[1].score || 0) : null;
  if (latest >= 80) return 'Strong';
  if (previous !== null && latest > previous) return 'Improving';
  return 'Learning';
}

r.get('/roadmaps', async (req, res) => {
  const [rows] = await db.execute(
    `SELECT r.id, r.topic, r.score, r.version_no AS versionNo, r.source_mode AS sourceMode,
            r.status, r.summary, r.gaps, r.strengths, r.created_at AS createdAt,
            COUNT(i.id) AS totalItems,
            SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END) AS completedItems
     FROM learning_roadmaps r
     LEFT JOIN roadmap_items i ON i.roadmap_id = r.id
     WHERE r.user_id = ?
     GROUP BY r.id
     ORDER BY r.topic ASC, r.version_no DESC, r.created_at DESC`,
    [req.user.id]
  );

  res.json(rows.map((row) => ({
    ...row,
    score: Number(row.score || 0),
    totalItems: Number(row.totalItems || 0),
    completedItems: Number(row.completedItems || 0),
    progress: Number(row.totalItems || 0)
      ? Math.round((Number(row.completedItems || 0) / Number(row.totalItems || 0)) * 100)
      : 0,
    gaps: parseJson(row.gaps),
    strengths: parseJson(row.strengths),
  })));
});

r.get('/roadmaps/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid roadmap id.' });

  const [rows] = await db.execute(
    `SELECT id, topic, score, version_no AS versionNo, source_mode AS sourceMode, status,
            summary, gaps, strengths, created_at AS createdAt
     FROM learning_roadmaps
     WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, req.user.id]
  );
  const roadmap = rows[0];
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

  const [items] = await db.execute(
    `SELECT id, sequence_no AS sequenceNo, title, description, concept,
            completed, completed_at AS completedAt
     FROM roadmap_items
     WHERE roadmap_id = ?
     ORDER BY sequence_no ASC`,
    [id]
  );

  res.json({
    ...roadmap,
    score: Number(roadmap.score || 0),
    gaps: parseJson(roadmap.gaps),
    strengths: parseJson(roadmap.strengths),
    items: items.map((item) => ({ ...item, completed: Boolean(item.completed) })),
  });
});

r.patch('/items/:id', async (req, res) => {
  const itemId = Number(req.params.id);
  const completed = Boolean(req.body?.completed);
  if (!itemId) return res.status(400).json({ message: 'Invalid roadmap item id.' });

  const [rows] = await db.execute(
    `SELECT i.id
     FROM roadmap_items i
     INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
     WHERE i.id = ? AND r.user_id = ? LIMIT 1`,
    [itemId, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Roadmap item not found.' });

  await db.execute(
    `UPDATE roadmap_items
     SET completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = ?`,
    [completed ? 1 : 0, completed ? 1 : 0, itemId]
  );

  res.json({ id: itemId, completed });
});

r.get('/progress', async (req, res) => {
  const [attempts] = await db.execute(
    `SELECT id, topic, score, created_at AS createdAt
     FROM attempts
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC`,
    [req.user.id]
  );

  const grouped = Object.fromEntries(topics.map((topic) => [topic.name, []]));
  for (const attempt of attempts) {
    if (!grouped[attempt.topic]) grouped[attempt.topic] = [];
    grouped[attempt.topic].push({ ...attempt, score: Number(attempt.score) });
  }

  const topicProgress = topics.map((topic) => {
    const history = grouped[topic.name] || [];
    const chronological = [...history].reverse();
    const firstScore = chronological[0]?.score ?? null;
    const latestScore = history[0]?.score ?? null;
    return {
      topic: topic.name,
      status: topicStatus(history),
      latestScore,
      firstScore,
      improvement: firstScore === null || latestScore === null ? 0 : latestScore - firstScore,
      attempts: history.length,
      history: chronological,
    };
  });

  const unstarted = topicProgress.find((x) => x.status === 'Not Started');
  const attempted = topicProgress.filter((x) => x.latestScore !== null);
  const weakest = attempted.length
    ? [...attempted].sort((a, b) => a.latestScore - b.latestScore)[0]
    : null;
  const deterministicRecommended = unstarted || weakest || topicProgress[0];
  let recommendedNextTopic = deterministicRecommended ? {
    topic: deterministicRecommended.topic,
    reason: deterministicRecommended.status === 'Not Started'
      ? 'You have not assessed this topic yet.'
      : `This is currently your lowest-scoring assessed topic at ${deterministicRecommended.latestScore}%.`,
    source: 'Deterministic fallback',
  } : null;

  try {
    const aiRecommendation = await recommendNextTopic({
      topicProgress: topicProgress.map(({ topic, status, latestScore, improvement, attempts }) => ({ topic, status, latestScore, improvement, attempts })),
    });
    recommendedNextTopic = { ...aiRecommendation, source: 'Gemini' };
  } catch (error) {
    if (error.code !== 'GEMINI_NOT_CONFIGURED') {
      console.error('Gemini topic recommendation failed, using fallback:', error.message);
    }
  }

  const [roadmapCounts] = await db.execute(
    `SELECT COUNT(i.id) AS totalItems,
            SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END) AS completedItems
     FROM learning_roadmaps r
     LEFT JOIN roadmap_items i ON i.roadmap_id = r.id
     WHERE r.user_id = ? AND r.status = 'ACTIVE'`,
    [req.user.id]
  );
  const counts = roadmapCounts[0] || {};
  const totalItems = Number(counts.totalItems || 0);
  const completedItems = Number(counts.completedItems || 0);

  res.json({
    topics: topicProgress,
    recommendedNextTopic,
    roadmapProgress: {
      totalItems,
      completedItems,
      percent: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
    },
  });
});

export default r;
