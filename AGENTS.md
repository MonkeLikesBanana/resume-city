# Vasnova City agent rules

Aarav Vaswani's résumé site: a 3D city (Vite, React 19, TypeScript, React Three Fiber, Tailwind v4). Live at https://resume-city.vercel.app (Vercel deploys `main`).

## Commands (Node is at ~/.local/node/current/bin; never use sudo)
- Dev: `npm run dev`  · Build (typecheck + bundle): `npm run build`  · Lint: `npm run lint`
- A change is done only when `npm run build` passes and lint has no new warnings.

## Rules
- Work on the `polish` branch. Never push, merge to `main`, or touch Vercel; the coordinator handles git and deploys.
- Don't edit `.env.local` or `public/resume-aarav-vaswani.pdf`.
- Résumé facts live in `src/content/*.ts`. Don't invent accomplishments, dates or numbers; if copy needs a fact you don't have, leave `TODO(fact): ...` and list it in your report.
- Goal is a professional, restrained design that a recruiter or admissions reader trusts in 10 seconds. Prefer removing effects over adding them.
- The plain HTML view (`NoWebGLFallback`, `AccessibleNav`) must stay complete: every stop's content readable without WebGL.
