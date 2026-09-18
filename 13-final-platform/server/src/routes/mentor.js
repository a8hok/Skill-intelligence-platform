import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { explainMistake } from '../services/geminiService.js';

const r = Router();
r.use(auth);

r.post('/explain', async (req, res) => {
  try {
    const message = await explainMistake(req.body || {});
    res.json({ message, generatedBy: 'Gemini' });
  } catch (error) {
    console.error('Gemini mentor failed, using local explanation:', error.message);
    const body = req.body || {};
    const message = [
      `Concept: ${body.concept || 'Core concept'}.`,
      `Correct answer: ${body.correctAnswer || 'See the answer review'}.`,
      body.explanation || 'Review the concept and compare each option with the definition or expected behavior.',
      `Your answer was: ${body.userAnswer || 'Not answered'}. Revisit why it differs from the correct choice and try a similar example.`,
    ].join(' ');
    res.json({ message, generatedBy: 'Built-in explanation' });
  }
});

export default r;
