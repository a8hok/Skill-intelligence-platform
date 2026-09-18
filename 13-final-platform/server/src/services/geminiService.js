import { GoogleGenAI } from '@google/genai';

const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function client() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured. Add it to server/.env.');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const quizSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
          concept: { type: 'string' },
          explanation: { type: 'string' },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
        },
        required: ['question', 'options', 'correctIndex', 'concept', 'explanation', 'difficulty'],
      },
    },
  },
  required: ['questions'],
};


const recommendationSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    reason: { type: 'string' },
  },
  required: ['topic', 'reason'],
};

const analysisSchema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    learningPath: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
    },
  },
  required: ['headline', 'summary', 'strengths', 'gaps', 'learningPath'],
};

export async function generateQuiz({ topic, description, level, focusConcepts = [] }) {
  const ai = client();
  const focus = focusConcepts.length
    ? `This is a reassessment. Give extra attention to these previously weak concepts: ${focusConcepts.join(', ')}.`
    : 'Cover a balanced set of core concepts for this topic.';

  const prompt = `
You are creating a technical assessment for engineering-college students.
Topic: ${topic}
Topic context: ${description}
Level: ${level}
${focus}

Create exactly 10 single-answer multiple-choice questions.
Requirements:
- Exactly 4 distinct options per question.
- Exactly one correct option, represented by correctIndex from 0 to 3.
- Mix conceptual and applied/scenario questions.
- Avoid trick wording and ambiguous answers.
- Difficulty mix should be approximately 3 Easy, 5 Medium, 2 Hard.
- concept should be a short skill label suitable for analytics.
- explanation should briefly teach why the correct answer is right.
- Questions should be appropriate for an engineering-college student workshop.
- Do not mention Gemini or AI in the questions.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.65,
      responseMimeType: 'application/json',
      responseSchema: quizSchema,
    },
  });

  const parsed = JSON.parse(response.text);
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== 10) {
    throw new Error('Gemini returned an invalid quiz. Please try again.');
  }

  return parsed.questions;
}

export async function analyzeResult({ topic, score, correct, total, concepts }) {
  const ai = client();
  const prompt = `
You are an AI learning coach for engineering-college students.
Analyze this assessment result and create concise, actionable feedback.

Topic: ${topic}
Score: ${score}% (${correct}/${total})
Concept performance JSON: ${JSON.stringify(concepts)}

Return:
- headline: one short encouraging but factual sentence.
- summary: 2 concise sentences describing performance and next priority.
- strengths: up to 4 concept names from the supplied data that performed best.
- gaps: up to 4 concept names from the supplied data that need the most work.
- learningPath: 3 to 5 ordered steps. Each step should have a short title and practical description. The final step should be a targeted reassessment.
Do not invent concepts that are unrelated to the supplied performance data.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.35,
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    },
  });

  return JSON.parse(response.text);
}


export async function recommendNextTopic({ topicProgress }) {
  const ai = client();
  const allowedTopics = topicProgress.map((item) => item.topic);
  const prompt = `
You are an engineering learning coach. Recommend exactly one next topic for this learner.
Only choose a topic from this allowed list: ${allowedTopics.join(', ')}.
Prefer an unassessed topic when a baseline is missing; otherwise prioritize the weakest or declining topic.
Keep the reason to one concise sentence.

Progress JSON: ${JSON.stringify(topicProgress)}
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: recommendationSchema,
    },
  });

  const parsed = JSON.parse(response.text);
  if (!allowedTopics.includes(parsed.topic)) throw new Error('Gemini recommended an unsupported topic.');
  return parsed;
}

export async function explainMistake({ topic, question, userAnswer, correctAnswer, explanation, concept }) {
  const ai = client();
  const prompt = `
Act as a concise engineering tutor.
Topic: ${topic}
Concept: ${concept || 'Core concept'}
Question: ${question}
Student answer: ${userAnswer || 'Not answered'}
Correct answer: ${correctAnswer}
Reference explanation: ${explanation}

Explain the mistake in 4 short parts:
1. What concept the question tests.
2. Why the correct answer is correct.
3. Why the student's answer does not fit.
4. One small example or memory tip.
Keep the response under 170 words. Do not be judgmental.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { temperature: 0.4, maxOutputTokens: 320 },
  });

  return response.text.trim();
}

export { model as GEMINI_MODEL };
