# Tempo AutoLogger

Convert git commits and daily work logs into Jira Tempo time entries using AI.

## How It Works

1. **Configure** - Enter your OpenRouter, Jira, and Tempo API credentials
2. **Input** - Paste a git log or daily work log
3. **Review** - AI generates worklog entries; edit as needed
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
| OpenRouter API Key | [openrouter.ai/keys](https://openrouter.ai/keys) - Create Key |
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
  services/       # API clients (openrouter, jira, tempo)
  types/          # TypeScript interfaces
  utils/          # parseCommits, formatTime, validators, prompts
  styles/         # CSS variables, global styles, CSS modules
  App.tsx         # Main orchestrator
  main.tsx        # React entry point
```

## Note on CORS

This app uses Vite's dev server proxy to route API calls to Jira and Tempo, avoiding browser CORS restrictions. This means it runs as a **local development tool** via `npm run dev`. Production deployment would require a backend proxy (e.g. Cloudflare Worker or Vercel Edge Function).
