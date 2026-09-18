import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';
import { topics } from '../services/topics.js';

const r = Router();
r.use(auth);

r.get('/', async (req, res) => {
  const [attempts] = await db.execute(
    `SELECT id, topic, score, created_at
     FROM attempts
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC`,
    [req.user.id]
  );

  const byTopic = new Map();
  for (const attempt of attempts) {
    if (!byTopic.has(attempt.topic)) byTopic.set(attempt.topic, []);
    byTopic.get(attempt.topic).push({ ...attempt, score: Number(attempt.score) });
  }

  const skills = topics.map((topic) => {
    const history = byTopic.get(topic.name) || [];
    if (!history.length) return { topic: topic.name, score: 0, level: 'Not Started', attempts: 0, improvement: 0 };
    const latest = history[0].score;
    const first = history[history.length - 1].score;
    const previous = history[1]?.score;
    const level = latest >= 80 ? 'Strong' : previous !== undefined && latest > previous ? 'Improving' : 'Learning';
    return { topic: topic.name, score: latest, level, attempts: history.length, improvement: latest - first };
  });

  const attemptedSkills = skills.filter((x) => x.attempts > 0);
  const overall = attemptedSkills.length
    ? Math.round(attemptedSkills.reduce((sum, x) => sum + x.score, 0) / attemptedSkills.length)
    : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((x) => Number(x.score))) : 0;
  const latestScore = attempts[0] ? Number(attempts[0].score) : 0;
  const strongestTopic = attemptedSkills.length ? [...attemptedSkills].sort((a, b) => b.score - a.score)[0] : null;
  const weakestTopic = attemptedSkills.length ? [...attemptedSkills].sort((a, b) => a.score - b.score)[0] : null;
  const topicsCompleted = attemptedSkills.length;
  const overallImprovement = attemptedSkills.length
    ? Math.round(attemptedSkills.reduce((sum, x) => sum + x.improvement, 0) / attemptedSkills.length)
    : 0;

  const [rankRows] = await db.query(
    'SELECT user_id, AVG(score) avg_score FROM attempts GROUP BY user_id ORDER BY avg_score DESC'
  );
  const foundRank = rankRows.findIndex((x) => Number(x.user_id) === Number(req.user.id));
  const rank = foundRank >= 0 ? foundRank + 1 : null;

  const [roadmapRows] = await db.execute(
    `SELECT COUNT(i.id) AS totalItems,
            SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END) AS completedItems
     FROM learning_roadmaps r
     LEFT JOIN roadmap_items i ON i.roadmap_id = r.id
     WHERE r.user_id = ? AND r.status = 'ACTIVE'`,
    [req.user.id]
  );
  const totalItems = Number(roadmapRows[0]?.totalItems || 0);
  const completedItems = Number(roadmapRows[0]?.completedItems || 0);

  const unstarted = skills.find((x) => x.level === 'Not Started');
  const recommendedNextTopic = unstarted || weakestTopic;

  res.json({
    overall,
    bestScore,
    latestScore,
    rank,
    skills,
    attempts,
    strongestTopic,
    weakestTopic,
    topicsCompleted,
    totalTopics: topics.length,
    overallImprovement,
    roadmapProgress: {
      completedItems,
      totalItems,
      percent: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
    },
    recommendedNextTopic: recommendedNextTopic ? recommendedNextTopic.topic : null,
  });
});

export default r;
