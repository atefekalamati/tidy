# Tidy

Live: https://tidy-atefe.netlify.app

A bilingual (English and Persian) kanban board with task chat rooms, built with Next.js. All data is saved in the browser's localStorage.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Test

```bash
npm test                         # unit and component tests (Vitest)
npx playwright install chromium  # once
npm run test:e2e                 # integration tests (Playwright)
```
