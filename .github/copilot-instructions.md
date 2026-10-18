# Repository guidance

## Build, test, and lint

Use Bun, as documented in `README.md`:

- `bun run dev` starts the Vite development server.
- `bun run build` runs the TypeScript project build, Vite production build, and landing-page prerender.
- `bun run preview` serves the production build locally.
- `bun run lint` runs ESLint across the repository.
- To lint one file, run `bunx eslint src/path/to/file.tsx`.

There is no configured test script or test runner in `package.json`, so there is no single-test command.

## Architecture

- The Vite frontend is a React 19 and TypeScript app. `index.html` is the public landing entry and `app.html` is the no-index app entry; both load `src/main.tsx`. Vite builds both, while `scripts/prerender-landing.mjs` server-renders the landing page into `dist/index.html`.
- `src/main.tsx` configures React Router routes (`/`, `/auth`, `/dashboard`), lazy-loads page components, and provides Convex Auth and shared notifications. Add pages in `src/pages` and register their routes there.
- `src/pages/Dashboard.tsx` coordinates the signed-in dashboard and its feature views. Reusable dashboard features live in `src/components/dashboard`; shared Shadcn-style primitives live in `src/components/ui`.
- Convex functions and the schema are in `src/convex`. `schema.ts` owns persisted table shapes and indexes; feature files expose queries and mutations consumed through the generated `api` bindings. The generated files in `src/convex/_generated` are tracked because frontend builds need them.
- Persistent data is split by purpose: account-owned journals, notes, cycle tracking, and progress are stored in Convex; planner activities, shortcuts, and display preferences are browser-local. Prayer times are calculated from browser location/preferences via `use-prayer-times` and the AlAdhan API rather than stored as account data.
- Authentication is configured in `src/convex/auth.ts` and `auth.config.ts`, with the client-facing `useAuth` hook in `src/hooks/use-auth.ts`. Email OTP delivery goes from the Convex email provider to the separate PHP endpoint in `hostinger-mailer`; relay credentials belong in server-side configuration, never in `VITE_` variables. See `README.md` and `hostinger-mailer/README.md` for deployment and demo-mode setup.

## Repository conventions

- Use imports from `react-router` (not `react-router-dom`) and the `@/` alias for `src` imports. Use `cn` from `@/lib/utils` when composing conditional Tailwind classes.
- Use `useAuth` from `@/hooks/use-auth` for frontend user/auth state. Secure every Convex query or mutation on the backend: derive the user with Convex Auth and restrict reads and writes to that user; frontend route guards are not authorization.
- For protected routes, wrap the page in `RequireAuth` rather than implementing a separate sign-in redirect. Its default screen explains the restriction and preserves the requested route for post-auth navigation.
- Keep persisted Convex data definitions and validators aligned with `src/convex/schema.ts`. Use generated Convex server/API types and `Id<"...">` / `Doc<"...">` types instead of plain strings for document IDs and records; do not hand-edit `src/convex/_generated`.
- Follow the existing Shadcn component and Tailwind v4 setup. Theme tokens and light/dark values are defined in `src/index.css`; use those semantic CSS variables rather than introducing app-wide hard-coded colors. Keep layouts responsive, especially dashboard navigation and dialogs.
- Treat browser storage as device-local preferences/drafts, not as a substitute for account-scoped records. Validate stored JSON before using it and use stable, namespaced keys, following the planner helpers.
