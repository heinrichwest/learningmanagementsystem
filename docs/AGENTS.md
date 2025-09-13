# Repository Guidelines

## Project Structure & Module Organization
- Root: static site files (`index.html`, `styles.css`, `script.js`, `server.js`), pages (`features.html`, `courses.html`, `pricing.html`, `solutions.html`).
- `deploy/`: ready-to-upload copy with minimal assets and a deployment README.
- `Theme/`: source theme with `gulp` + `npm` build (outputs to `live/`).
- `Images/`, `Documents/`, `courses/`: media, docs, and content data.

## Build, Test, and Development Commands
- Run locally (Node HTTP server):
  - `node server.js` (defaults to `PORT=3000`).
  - Windows alt: `start-server.bat` (sets `PORT=3001`).
- Theme build (from `Theme/`):
  - `npm install` — install build deps.
  - `npm run start` — dev server with live reload.
  - `npm run build` — production build to `live/`.
  - `npm run live` — compile all and prepare `live/` for publish.

## Coding Style & Naming Conventions
- JavaScript: ES6+, prefer small, pure functions; lowerCamelCase for vars/functions.
- CSS: BEM-like class names; keep components scoped; use variables where possible.
- HTML: semantic structure, accessible labels/alt text.
- Indentation: 2 spaces; line width ~100 chars.
- Linting/formatting (Theme): ESLint (Airbnb) and Prettier config; run via editor or `gulp` tasks.

## Testing Guidelines
- No automated tests; use manual browser testing across Chrome/Firefox/Safari + mobile.
- Validate: navigation, animations, forms, responsive layout, 404 handling.
- Quick check: run `node server.js` and visit `http://localhost:3000/` (or chosen `PORT`).

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (≤72 chars), e.g., "Fix mobile navbar toggle".
- Group related changes; avoid unrelated file noise.
- PRs: include summary, rationale, before/after screenshots for visual changes, and links to any issues.
- Keep diffs focused; update `deploy/` only when publishing artifacts are intended.

## Security & Configuration Tips
- Do not commit secrets; only static assets and content belong here.
- Set `PORT` via env when running locally (e.g., `set PORT=5000 && node server.js`).
- Large images: optimize before adding to `Images/`.
- For production, deploy contents from `deploy/` or Theme `live/` output to your web host.

