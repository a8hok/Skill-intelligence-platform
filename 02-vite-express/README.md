# 02 - Vite + Express

## From scratch

```bash
mkdir 02-vite-express && cd 02-vite-express
npm create vite@latest client -- --template react
mkdir server && cd server
npm init -y
npm install express cors dotenv
```

Add `"type": "module"` to the server package.json.

## Run
Terminal 1:
```bash
cd client
npm install
npm run dev
```

Terminal 2:
```bash
cd server
npm install
npm run dev
```

Open `http://localhost:4000/api/health`.
