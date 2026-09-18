# Step 6 - User Login + JWT

Concepts: password-free profile selection, JWT creation, protected `/api/auth/me`, localStorage session.

## Run
1. `mysql -u root -p < server/sql/schema.sql`
2. Copy `server/.env.example` to `server/.env`
3. In `server`: `npm install && npm run dev`
4. In `client`: `npm install && npm run dev`
5. Generate users, select one, and explain how the token protects later APIs.
