# AI Engineering Skill Intelligence Platform

A full-stack student skill intelligence platform using React, Node.js, Express, MySQL, Random User API, and optional Google Gemini AI.

## What the platform now supports

- Stable learner login profiles stored in MySQL.
- `Generate 5 users` fetches five more Random User profiles, saves them in MySQL, and appends them on the same login page.
- Assessments can use either:
  - Google Gemini for fresh AI-generated questions, or
  - the built-in question bank with no Gemini dependency.
- Every submitted assessment stores:
  - score and concept breakdown,
  - strengths and gaps,
  - answer review with correct answers and explanations,
  - a versioned personalized learning roadmap.
- **Things to Learn** shows saved roadmap versions grouped by topic.
- Roadmap items can be marked complete.
- Targeted reassessment prioritizes incomplete roadmap concepts.
- **Progress** shows topic status, score history, improvement, roadmap completion, recommended next topic, and assessment history.
- Previous assessments can be reopened to review answers and explanations.
- Dashboard includes strongest/weakest topic, topics assessed, latest score, roadmap progress, and overall improvement.
- Ranking compares learners by average assessment score.

## Product loop

`Login -> Assessment -> Skill analysis -> Saved roadmap -> Learn -> Mark progress -> Targeted reassessment -> Updated roadmap -> Track growth`

## Stack

- React + Vite
- Node.js + Express
- MySQL 8+
- JWT session after learner selection
- Random User API
- Google Gemini via `@google/genai`

## Fresh setup

```bash
npm install
mysql -u root -p < server/sql/schema.sql
cp server/.env.example server/.env
npm run dev
```

Fresh databases need **only `schema.sql`**.

## Upgrade an existing project database

If you already have the earlier Gemini-enabled schema, run:

```bash
mysql -u root -p < server/sql/migrate_learning_intelligence.sql
```

`migrate_gemini.sql` is only for databases created before the Gemini assessment tables existed.

## Environment

```env
PORT=4000
JWT_SECRET=replace-with-a-long-random-secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=skill_intelligence
USER_API_URL=https://randomuser.me/api/?results=5
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.6-flash
```

The built-in assessment mode works even when `GEMINI_API_KEY` is not configured.

## Default URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
