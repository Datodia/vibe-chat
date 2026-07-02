# vibe-chat

Realtime 1:1 chat app. Sign up, see who's online, message them live — and pick
up past conversations even when they're offline.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Socket.IO** for realtime presence + messaging (custom Node server)
- **MongoDB** via **Mongoose**
- **NextAuth v5** (credentials + optional Google)
- **Tailwind CSS v4** + shadcn-style UI, **Zustand**, **Zod**

## Features

- Sign up / sign in (auth modal on the landing page)
- Online users list with live presence
- Past conversation partners persist in the sidebar when offline
- 1:1 text chat with history, delivered in realtime over WebSockets

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # Next + Socket.IO on http://localhost:3000
```

### Environment

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random secret>   # openssl rand -base64 32
AUTH_SECRET=<same as above>
MONGO_URI=<your mongodb connection string>

# optional — enables "Continue with Google"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the custom Next + Socket.IO server |
| `npm run build` | Production build |
| `npm run start` | Run the production server |
| `npm run test` | Run the test suite (Vitest) |
| `npm run lint` | Lint |
| `npm run typecheck` | Type-check |

## Architecture

Feature-based layout under `src/`:

- `src/features/auth` — auth forms, hooks, service, user model
- `src/features/chat` — chat UI, socket hook, message model, service
- `server.ts` — custom server wiring Next + Socket.IO (presence, message delivery)
- `src/app/api` — route handlers (`/messages`, `/conversations`, auth)
