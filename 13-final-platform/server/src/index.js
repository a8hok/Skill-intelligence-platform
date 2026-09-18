import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import dashboardRoutes from './routes/dashboard.js';
import rankingRoutes from './routes/ranking.js';
import mentorRoutes from './routes/mentor.js';
import learningRoutes from './routes/learning.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/learning', learningRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
