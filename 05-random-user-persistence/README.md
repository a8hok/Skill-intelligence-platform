# 05 - Random User API + MySQL Persistence

## Flow

```text
React
  -> POST /api/users/generate
Express
  -> Random User API
  -> INSERT INTO MySQL
  -> SELECT users from MySQL
  -> JSON response
React
  -> render user cards
```

## Setup

```bash
cd server
cp .env.example .env
npm install
mysql -u root -p < sql/schema.sql
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Click **Generate 5 Users**. Refreshing the browser reads the stored users from MySQL.
