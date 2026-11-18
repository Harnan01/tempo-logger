# Tempo AutoLogger

Turn a daily work log into Jira Tempo time entries. No AI API is called: entries are built in the app
from one line per work block, so a person (or Claude driving the browser) writes exactly what gets logged.

## How It Works

1. **Configure** - Enter your Jira and Tempo API credentials
2. **Input** - For each day, set the schedule, DSM ticket and meetings, and write the Work Log as one
   line per block: `09:00 – 10:30: Implemented crew filter [CREW-123]`
3. **Review** - The app builds the entries (work lines + DSM + meetings); edit as needed
4. **Submit** - Entries are logged to Tempo via the API

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cp .env.example .env.local   # optional: configure defaults
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Getting API Credentials

| Credential | Where to get it |
|------------|----------------|
| Tempo API Token | Tempo > Settings > API Integration > New Token |
| Jira Account ID | Your Jira profile URL contains the `accountId` |
| Jira Domain | e.g. `yourcompany.atlassian.net` |
| Jira Email | Your Atlassian account email |
| Jira API Token | [id.atlassian.com](https://id.atlassian.com) > Security > API tokens |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run type-check` | Run TypeScript compiler checks |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Architecture

```
src/
  components/
    layout/       # Header, StepsBar, AppLayout
    steps/        # Step1Config, Step2Input, Step3Review, Step4Results
    shared/       # Button, Card, ErrorBox, Spinner, FormField, etc.
  hooks/          # useCredentials, useWorkflow, useEntries
  services/       # API clients (jira, tempo)
  types/          # TypeScript interfaces
  utils/          # buildEntries, formatTime, validators, prompts
  styles/         # CSS variables, global styles, CSS modules
  App.tsx         # Main orchestrator
  main.tsx        # React entry point
```

## Note on CORS

This app uses Vite's dev server proxy to route API calls to Jira and Tempo, avoiding browser CORS restrictions. This means it runs as a **local development tool** via `npm run dev`. Production deployment would require a backend proxy (e.g. Cloudflare Worker or Vercel Edge Function).
