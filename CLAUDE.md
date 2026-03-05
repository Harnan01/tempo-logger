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
- `src/hooks/` - React hooks (useCredentials, useEntries, useWorkflow, useTheme)
- `src/theme/` - Ant Design theme configs (antdTheme.ts with dark/light themes)
- `src/components/shared/` - Ant Design wrapper components (Button, Card, FormField, NoteBox, StatCard, Spinner, DurationInput, StepActions)
- `src/components/layout/` - Sidebar + content layout (AppLayout with antd Layout.Sider + Steps)
- `src/components/steps/` - Wizard step views (Step1Config through Step4Results, DayCard)
- `src/styles/` - Global CSS (animations, reduced-motion only)

## UI Framework

- **Ant Design v6** for all UI components (Layout, Card, Input, Button, Tag, etc.)
- **antd ConfigProvider** with theme tokens for dark/light theme switching
- **antd App.useApp()** for message API (toast notifications)
- Sidebar layout with vertical Steps navigation, collapsible on mobile
- No CSS Modules — all styling via antd theme tokens and inline styles
- `<Input type="date/time">` used instead of antd DatePicker/TimePicker (avoids dayjs dependency)

## Conventions

- Services return typed results, throw `ApiError` on failure
- Hooks manage domain state; components are presentational
- FormField uses render-prop pattern wrapping antd Form.Item
- Path alias: `@/` maps to `src/`
- Node.js 20+ required (see `.nvmrc`)

## API Proxy

Vite dev server proxies `/jira-api/*` and `/tempo-api/*` to avoid CORS.
The Jira proxy uses an `X-Jira-Domain` header for dynamic routing.
