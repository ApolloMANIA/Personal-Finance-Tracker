# Personal Finance Tracker

Full-stack personal finance app for tracking accounts, income, expenses, and recurring payments with a live dashboard.

## Features

- JWT authentication (signup / login)
- Multiple accounts (Checking, Savings, Credit, etc.)
- Income & expense transactions with automatic balance updates
- Recurring payments with pay / delete actions and due reminders
- Interactive charts and monthly growth cards

## Stack

| Layer | Tech |
|-------|------|
| Client | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Server | Node.js, Express 5, MongoDB (Mongoose), JWT, bcryptjs |

## Setup

### 1. Clone & install

```bash
git clone https://github.com/ApolloMANIA/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker

cd server && npm install && cd ..
cd client && npm install --legacy-peer-deps && cd ..
```

### 2. Environment variables

**Server** — create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_long_random_secret
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

**Client** — create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

See `.env.example` at the repo root for a full template.

### 3. Run locally

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — UI
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deploy

### API (Railway / Render / Fly.io)

1. Set root or start command to the `server` folder: `npm start`
2. Add env vars: `MONGO_URI`, `JWT_SECRET_KEY`, `PORT`, `CLIENT_ORIGIN` (your frontend URL)

### Client (Vercel / Netlify / Cloudflare Pages)

1. Build directory: `client`
2. Build command: `npm run build` (use `--legacy-peer-deps` on install if needed)
3. Set `VITE_API_URL` to your deployed API URL ending in `/api` (e.g. `https://your-api.onrender.com/api`)

## Contributors

- Eshan Kumar
- Hrishab Neupane
- Biplov Oli
