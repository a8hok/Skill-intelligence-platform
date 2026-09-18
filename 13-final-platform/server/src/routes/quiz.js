import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';
import { topics, findTopic } from '../services/topics.js';
import { analyzeResult, generateQuiz, GEMINI_MODEL } from '../services/geminiService.js';
import { generateLocalQuiz, LOCAL_MODEL } from '../services/localQuestionBank.js';

const r = Router();
r.use(auth);

r.get('/topics', (_req, res) => res.json(topics));

function parseJson(value, fallback = {}) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function deterministicAnalysis({ score, correct, total, concepts }) {
  const strengths = concepts.filter((x) => x.score >= 70).map((x) => x.name).slice(0, 4);
  const gaps = concepts.filter((x) => x.score < 70).sort((a, b) => a.score - b.score).map((x) => x.name).slice(0, 4);
  const pathGaps = gaps.length ? gaps : [...concepts].sort((a, b) => a.score - b.score).slice(0, 2).map((x) => x.name);

  return {
    headline: score >= 80
      ? 'Strong understanding with a few areas to polish.'
      : score >= 60
        ? 'Good foundation with clear opportunities to improve.'
        : 'Focus on the fundamentals before your next attempt.',
    summary: `You answered ${correct} of ${total} questions correctly. Prioritize the weakest concepts below, practise them, and then take another assessment.`,
    strengths,
    gaps,
    learningPath: [
      ...pathGaps.slice(0, 3).map((gap, i) => ({
        title: `${i === 0 ? 'Strengthen' : 'Practice'} ${gap}`,
        description: `Review ${gap} fundamentals, work through examples, and test yourself with a short practice set.`,
        concept: gap,
      })),
      {
        title: 'Targeted reassessment',
        description: 'Retake this topic and compare your new score with the previous attempt.',
        concept: null,
      },
    ],
  };
}

async function roadmapFocus(userId, roadmapId) {
  if (!roadmapId) return [];
  const [rows] = await db.execute(
    `SELECT i.concept, i.title
     FROM roadmap_items i
     INNER JOIN learning_roadmaps r ON r.id = i.roadmap_id
     WHERE r.id = ? AND r.user_id = ? AND i.completed = 0
     ORDER BY i.sequence_no ASC`,
    [roadmapId, userId]
  );
  return rows
    .map((row) => row.concept || row.title)
    .filter(Boolean)
    .slice(0, 4);
}

r.get('/history', async (req, res) => {
  const [rows] = await db.execute(
    `SELECT a.id, a.topic, a.score, a.correct_count AS correctCount,
            a.total_questions AS totalQuestions, a.details, a.created_at AS createdAt,
            r.id AS roadmapId, r.version_no AS roadmapVersion
     FROM attempts a
     LEFT JOIN learning_roadmaps r ON r.attempt_id = a.id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC, a.id DESC`,
    [req.user.id]
  );

  res.json(rows.map((row) => {
    const details = parseJson(row.details, {});
    return {
      id: row.id,
      topic: row.topic,
      score: Number(row.score),
      correctCount: Number(row.correctCount),
      totalQuestions: Number(row.totalQuestions),
      createdAt: row.createdAt,
      generatedBy: details.generatedBy || 'Unknown',
      mode: details.mode || 'gemini',
      roadmapId: row.roadmapId || details.roadmapId || null,
      roadmapVersion: row.roadmapVersion || null,
    };
  }));
});

r.get('/history/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid attempt id.' });

  const [rows] = await db.execute(
    `SELECT a.id, a.topic, a.score, a.correct_count AS correctCount,
            a.total_questions AS totalQuestions, a.details, a.created_at AS createdAt,
            r.id AS roadmapId, r.version_no AS roadmapVersion
     FROM attempts a
     LEFT JOIN learning_roadmaps r ON r.attempt_id = a.id
     WHERE a.id = ? AND a.user_id = ? LIMIT 1`,
    [id, req.user.id]
  );
  const row = rows[0];
  if (!row) return res.status(404).json({ message: 'Attempt not found.' });
  const details = parseJson(row.details, {});

  res.json({
    id: row.id,
    topic: row.topic,
    score: Number(row.score),
    correct: Number(row.correctCount),
    total: Number(row.totalQuestions),
    createdAt: row.createdAt,
    headline: details.headline || '',
    summary: details.summary || '',
    strengths: details.strengths || [],
    gaps: details.gaps || [],
    concepts: details.concepts || [],
    learningPath: details.learningPath || [],
    review: details.review || [],
    generatedBy: details.generatedBy || 'Unknown',
    mode: details.mode || 'gemini',
    roadmapId: row.roadmapId || details.roadmapId || null,
    roadmapVersion: row.roadmapVersion || null,
  });
});

r.get('/:topic', async (req, res) => {
  try {
    const topic = findTopic(req.params.topic);
    if (!topic) return res.status(404).json({ message: 'Topic not found.' });

    const mode = String(req.query.mode || 'gemini').toLowerCase() === 'local' ? 'local' : 'gemini';
    const roadmapId = Number(req.query.roadmapId || 0) || null;
    let focusConcepts = await roadmapFocus(req.user.id, roadmapId);

    if (!focusConcepts.length) {
      const [lastAttempts] = await db.execute(
        `SELECT details FROM attempts WHERE user_id = ? AND topic = ? ORDER BY created_at DESC, id DESC LIMIT 1`,
        [req.user.id, topic.name]
      );
      if (lastAttempts[0]?.details) {
        const details = parseJson(lastAttempts[0].details, {});
        focusConcepts = Array.isArray(details?.gaps) ? details.gaps.slice(0, 4) : [];
      }
    }

    const privateQuestions = mode === 'local'
      ? generateLocalQuiz({ topic: topic.name, focusConcepts })
      : await generateQuiz({ topic: topic.name, description: topic.description, level: topic.level, focusConcepts });

    const modelName = mode === 'local' ? LOCAL_MODEL : GEMINI_MODEL;
    const generatedBy = mode === 'local' ? 'Built-in question bank' : 'Gemini';

    const [result] = await db.execute(
      `INSERT INTO assessment_sessions(user_id, topic, questions, model_name)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, topic.name, JSON.stringify(privateQuestions), modelName]
    );

    const questions = privateQuestions.map((q, index) => ({
      id: String(index + 1),
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));

    res.json({
      assessmentId: result.insertId,
      topic: topic.name,
      questions,
      generatedBy,
      model: modelName,
      mode,
      reassessmentFocus: focusConcepts,
      roadmapId,
    });
  } catch (error) {
    console.error('Quiz generation failed:', error);
    const status = error.code === 'GEMINI_NOT_CONFIGURED' ? 503 : 500;
    res.status(status).json({ message: error.message || 'Unable to generate assessment.' });
  }
});

r.post('/submit', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { assessmentId, answers = {} } = req.body;
    if (!assessmentId) return res.status(400).json({ message: 'Assessment id is required.' });

    const [sessions] = await connection.execute(
      `SELECT id, topic, questions, model_name, submitted_at FROM assessment_sessions
       WHERE id = ? AND user_id = ? LIMIT 1`,
      [assessmentId, req.user.id]
    );
    const session = sessions[0];
    if (!session) return res.status(404).json({ message: 'Assessment not found.' });
    if (session.submitted_at) return res.status(409).json({ message: 'This assessment was already submitted.' });

    const questions = parseJson(session.questions, []);
    let correct = 0;
    const byConcept = {};
    const review = questions.map((q, index) => {
      const id = String(index + 1);
      const selectedIndex = Number(answers[id]);
      const ok = Number.isInteger(selectedIndex) && selectedIndex === q.correctIndex;
      if (ok) correct += 1;
      if (!byConcept[q.concept]) byConcept[q.concept] = { correct: 0, total: 0 };
      byConcept[q.concept].total += 1;
      if (ok) byConcept[q.concept].correct += 1;
      return {
        question: q.question,
        correct: ok,
        userAnswer: Number.isInteger(selectedIndex) ? q.options[selectedIndex] : 'Not answered',
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
        concept: q.concept,
      };
    });

    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    const concepts = Object.entries(byConcept).map(([name, value]) => ({
      name,
      score: Math.round((value.correct / value.total) * 100),
      correct: value.correct,
      total: value.total,
    }));
    const isLocal = session.model_name === LOCAL_MODEL;
    let analysis;

    if (isLocal) {
      analysis = deterministicAnalysis({ score, correct, total, concepts });
    } else {
      try {
        analysis = await analyzeResult({ topic: session.topic, score, correct, total, concepts });
      } catch (error) {
        console.error('Gemini result analysis failed, using deterministic fallback:', error.message);
        analysis = deterministicAnalysis({ score, correct, total, concepts });
      }
    }

    const fallback = deterministicAnalysis({ score, correct, total, concepts });
    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 4) : fallback.strengths;
    const gaps = Array.isArray(analysis.gaps) ? analysis.gaps.slice(0, 4) : fallback.gaps;
    const rawPath = Array.isArray(analysis.learningPath) && analysis.learningPath.length ? analysis.learningPath : fallback.learningPath;
    const learningPath = rawPath.map((step, index) => ({
      title: step.title,
      description: step.description,
      concept: step.concept || gaps[index] || null,
    }));
    const generatedBy = isLocal ? 'Built-in question bank' : 'Gemini';
    const mode = isLocal ? 'local' : 'gemini';

    await connection.beginTransaction();

    const baseDetails = {
      headline: analysis.headline || fallback.headline,
      summary: analysis.summary || fallback.summary,
      concepts,
      strengths,
      gaps,
      learningPath,
      assessmentId,
      generatedBy,
      mode,
      review,
    };

    const [attemptResult] = await connection.execute(
      `INSERT INTO attempts(user_id, topic, score, correct_count, total_questions, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, session.topic, score, correct, total, JSON.stringify(baseDetails)]
    );

    const [versionRows] = await connection.execute(
      `SELECT COALESCE(MAX(version_no), 0) + 1 AS nextVersion
       FROM learning_roadmaps WHERE user_id = ? AND topic = ?`,
      [req.user.id, session.topic]
    );
    const versionNo = Number(versionRows[0]?.nextVersion || 1);

    await connection.execute(
      `UPDATE learning_roadmaps SET status = 'SUPERSEDED'
       WHERE user_id = ? AND topic = ? AND status = 'ACTIVE'`,
      [req.user.id, session.topic]
    );

    const [roadmapResult] = await connection.execute(
      `INSERT INTO learning_roadmaps
       (user_id, assessment_id, attempt_id, topic, score, source_mode, version_no, summary, strengths, gaps, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        req.user.id,
        assessmentId,
        attemptResult.insertId,
        session.topic,
        score,
        mode,
        versionNo,
        baseDetails.summary,
        JSON.stringify(strengths),
        JSON.stringify(gaps),
      ]
    );

    for (let index = 0; index < learningPath.length; index += 1) {
      const step = learningPath[index];
      await connection.execute(
        `INSERT INTO roadmap_items(roadmap_id, sequence_no, title, description, concept)
         VALUES (?, ?, ?, ?, ?)`,
        [roadmapResult.insertId, index + 1, step.title, step.description, step.concept || null]
      );
    }

    const details = { ...baseDetails, roadmapId: roadmapResult.insertId, roadmapVersion: versionNo };
    await connection.execute('UPDATE attempts SET details = ? WHERE id = ?', [JSON.stringify(details), attemptResult.insertId]);
    await connection.execute('UPDATE assessment_sessions SET submitted_at = CURRENT_TIMESTAMP WHERE id = ?', [assessmentId]);
    await connection.commit();

    res.json({
      attemptId: attemptResult.insertId,
      roadmapId: roadmapResult.insertId,
      roadmapVersion: versionNo,
      topic: session.topic,
      score,
      correct,
      total,
      headline: details.headline,
      summary: details.summary,
      strengths,
      gaps,
      concepts,
      learningPath,
      review,
      generatedBy,
      mode,
    });
  } catch (error) {
    try { await connection.rollback(); } catch {}
    console.error('Assessment submission failed:', error);
    res.status(500).json({ message: error.message || 'Unable to submit assessment.' });
  } finally {
    connection.release();
  }
});

export default r;
