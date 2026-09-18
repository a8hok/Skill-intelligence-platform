# 03 - Vite + Express + MySQL

## Add MySQL to the server

```bash
cd server
npm install mysql2
cp .env.example .env
```

Create the database:

```bash
mysql -u root -p < sql/schema.sql
```

Update `.env` with your MySQL password.

Run client and server, then open:

```text
http://localhost:4000/api/db-health
```
