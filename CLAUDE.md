# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (compiles TypeScript to ./dist)
npm run build

# Install dependencies
npm install
```

No linting or test tooling is configured.

## Architecture

This is a vanilla TypeScript browser application — no framework, no bundler, no runtime dependencies. The TypeScript compiler (`tsc`) outputs ESNext modules directly to `./dist`, which the HTML page loads.

### Key files

- **`index.ts`** — All application logic: DOM wiring, test lifecycle (start/cursor move/end), keyboard input handling, timer, WPM/accuracy calculation, and localStorage operations.
- **`data.ts`** — Static database of 30 typing passages organized by difficulty (`easy`, `medium`, `hard`), 10 per level.
- **`index.html`** — Page structure; loads compiled `./dist/index.js`.
- **`styles.css`** — All styling. Uses CSS custom properties for the color palette defined in `style-guide.md`.

### State model (in `index.ts`)

The test runs through three phases managed by a single `keydown` listener that is added/removed as the test starts and ends:

1. **Idle** — start button visible, overlay shown.
2. **Running** — listener active, characters highlighted correct (green) or incorrect (red/underlined) as the user types; a cursor `<span>` tracks position. In timed mode, a `setInterval` counts down from 60 s.
3. **Results** — modal shown with WPM, accuracy, char counts. Results saved to `localStorage` as a JSON array; personal best (highest WPM on a given difficulty) is persisted separately.

### TypeScript strictness

`tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. Array/object index access always returns `T | undefined` — use proper null-checks rather than non-null assertions where possible.

### Design tokens

Colors and breakpoints are in `style-guide.md`. The two responsive breakpoints are **375 px** (mobile) and **1440 px** (desktop).
