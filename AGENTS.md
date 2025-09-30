# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`: `components/` (views, `PascalCase` dirs, `.tsx/.jsx`), `services/` (API clients), `slices/` + `store.ts` (Redux Toolkit), `hooks/`, `utilities/`, `constants/`, styles in `scss/` and `styles/`, assets in `img/` and `font/`.
- Static assets and HTML template live in `public/`.
- Config: `package.json`, `tsconfig.json`, `knip.json`. Avoid changing build tooling unless necessary.

## Build, Test, and Development Commands
- `npm start` — runs CRA dev server at `http://localhost:3000` with hot reload.
- `npm run build` — creates production build in `build/`.
- `npm test` — launches Jest in watch mode.
- `npx knip` — reports unused files/exports per `knip.json`.
- Use one package manager consistently. Prefer `npm` (both `package-lock.json` and `yarn.lock` exist; avoid mixing).

## Coding Style & Naming Conventions
- TypeScript preferred for new code: `.tsx` for components, `.ts` for utilities.
- Indentation: 2 spaces; keep lines < 120 chars.
- Components and files: `PascalCase` for React components (e.g., `MasterSettingsWrap.tsx`); hooks `useThing`; CSS/SCSS modules `kebab-case.module.scss`.
- Prefer named exports from modules. Follow CRA ESLint (`react-app`) guidance; no custom Prettier config is enforced.

## Testing Guidelines
- Co-locate tests as `ComponentName.test.tsx` or `feature.test.ts` near the code or under `src/__tests__/`.
- Use React Testing Library for components and Jest for units.
- Cover reducers/selectors in `slices/` and core `services/`. Aim for meaningful coverage.

## Commit & Pull Request Guidelines
- Commit messages: imperative, concise (e.g., "Fix translate", "Migrate Yandex Maps API v3"). Reference issues with `#123` when applicable.
- PRs must include: clear description, linked issues, screenshots/GIFs for UI changes, and test/verification steps.
- Keep PRs small and focused; avoid drive-by refactors.

## Security & Configuration Tips
- Use `.env` with `REACT_APP_*` variables; never commit secrets.
- Read API base URLs from env in `src/services/*`.

## Agent-Specific Instructions
- Keep changes minimal and consistent with ESLint/CRA. Update docs if structure or commands change.

## Two-Day Refactor Plan (Fast Track)

- Purpose: deliver maximum value in 2 days without breaking behavior. Focus on risk removal, discipline, and visible performance wins.

### Day 1 — Baseline Hardening
- Package manager: use one (prefer `npm`), remove extra lock file.
- Enable `<React.StrictMode>` in `src/index.jsx`.
- Sanitize all `dangerouslySetInnerHTML` (e.g., `src/components/Article/Article.jsx`) with DOMPurify.
- ESLint + Prettier (baseline config); add `typecheck` script.
- Add minimal performance tooling: `size-limit` and `source-map-explorer`.
- Manual checks:
  - `npm install`, `npm run lint`, `npm run typecheck`, `npm run build` succeed.
  - `npm run analyze` shows bundle contents; `npm run size` within provisional budget.
  - No unused legacy configs (e.g., document or remove `webpack.config.js`).

### Day 2 — Visible Wins
- Lazy-load 2–3 heavy blocks/pages (e.g., Swiper, emoji picker) via `React.lazy` + `Suspense`.
- Introduce `shared/ui/Modal` using RSuite and replace 2–3 critical `reactjs-popup` usages.
- Add `shared/api` client (axios/fetch wrapper) and migrate one key feature call to it.
- Migrate one server-state feature to React Query; keep Redux for client-only UI state.
- Reduce obvious redundant `useEffect` in 1–2 components; extract complex logic into a model hook + subcomponents where easy.
- Manual checks:
  - Build shows lazy chunks for heavy widgets; size is stable or improved.
  - Replaced modals pass a11y basics (focus trap, Esc, Tab).
  - Migrated feature works with proper loading/error/cache behavior.
  - Key screens function unchanged in a smoke test.

### Scope Notes
- This fast track intentionally avoids full style system migration, strict TS across all code, and build tool changes (Vite). Keep these as future tasks.

### PR Workflow (simple)
- Create small PRs per step (e.g., StrictMode, DOMPurify, lazy widgets, modal replacements, shared/api, one React Query feature).
- Use a short checklist in each PR: build/lint/typecheck green; smoke test done; bundle analyzed.

### Rollback & Safety
- Keep changes atomic to allow quick revert.
- Document any functional risk and fallback before merging.
