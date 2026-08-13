# AI Resume Analyzer

## Start the project

You need **two terminals** running at the same time.

### Terminal 1 — Backend
```bash
cd Server
npm install
node app.js
```
Server runs at: http://localhost:5000

### Terminal 2 — Frontend
```bash
cd Client/client
npm install
npm run dev
```
App runs at: http://localhost:5173

---

## Environment Variables

**Server/.env**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key   # optional — enables GPT-powered analysis
```

> If OPENAI_API_KEY is not set, the app falls back to keyword-based analysis automatically.

**Client/client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Common errors

| Error | Fix |
|-------|-----|
| "Cannot connect to server" | Start the backend first (`node Server/app.js`) |
| "Registration failed" | Backend is not running or MONGO_URI is wrong |
| E11000 duplicate key username | Fixed automatically on server start |
# Major_projects
# Analyzer
