# Tempo Logger - Development Guide

## Commands

- `npm run dev` - Start Vite dev server (localhost:5173)
- `npm run build` - Type-check + production build
- `npm run type-check` - TypeScript check only
- `npm run lint` - ESLint
- `npm run lint:fix` - ESLint with auto-fix
- `npm run format` - Prettier format
- `npm run format:check` - Prettier check
- `npm test` - Run Vitest
- `npm run test:coverage` - Run tests with coverage

## Project Structure

- `src/types/` - TypeScript interfaces (Credentials, WorklogEntry, SubmitResult, API types)
- `src/utils/` - Pure functions (parseCommits, groupByTicket, secToHuman, validators, prompts)
- `src/services/` - API clients (openrouter.ts, jira.ts, tempo.ts, api-client.ts)
- `src/hooks/` - React hooks (useCredentials, useEntries, useWorkflow)
- `src/components/shared/` - Reusable UI atoms (Button, Card, FormField, etc.)
- `src/components/layout/` - Layout shells (Header, StepsBar, AppLayout)
- `src/components/steps/` - Wizard step views (Step1Config through Step4Results)
- `src/styles/` - CSS variables, global styles, component CSS modules

## Conventions

- CSS Modules for component styles (`.module.css` files)
- Services return typed results, throw `ApiError` on failure
- Hooks manage domain state; components are presentational
- Path alias: `@/` maps to `src/`
- Node.js 20+ required (see `.nvmrc`)

## API Proxy

Vite dev server proxies `/jira-api/*` and `/tempo-api/*` to avoid CORS.
The Jira proxy uses an `X-Jira-Domain` header for dynamic routing.
