# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**whereiam** is a personal location-tracker single-page app built with Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS 3, and shadcn/ui. It renders a 3D globe (cobe) over a WebGL galaxy background (ogl) and displays the owner's current location.

### Running the dev server

```
pnpm dev          # starts on port 3001 with Turbopack
```

### Lint / Build / Start

See `package.json` scripts: `pnpm lint`, `pnpm build`, `pnpm start`.

### Data & environment

- The app reads/writes a local `db.json` (flat-file cache) in the project root. Copy `db.example.json` to `db.json` if it doesn't exist.
- Copy `.env.example` to `.env.local` for local env vars. The app works without `OPENAI_API_KEY` or `CALENDAR_ICS`; it falls back to the default/cached location in `db.json`.
- No external databases or Docker services are required.

### Caveats

- `sharp` native build scripts are blocked by pnpm's build-approval policy. Next.js falls back to its built-in image optimizer, so this is non-blocking for development.
- There is no test suite in this repo (no test scripts, no test files).
