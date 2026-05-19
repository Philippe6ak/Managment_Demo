# Role-Based Management App

Vite + React 19 + React Router DOM v7, JavaScript for app code, TypeScript kept only for shadcn/ui primitives (Vite/esbuild transpiles `.tsx` automatically).

## Project conventions

- **Pages**: `src/pages/*.jsx`
- **Hooks**: `src/hooks/*.js`
- **Contexts/lib**: `src/lib/*.{js,jsx}`
- **shadcn/ui primitives**: `src/components/ui/*.tsx` (kept as-is)
- **Path alias**: `@/* -> src/*` (see `jsconfig.json`)

## Setup

```bash
bun install
bun run dev
```

Create `.env` with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## shadcn/ui — install commands

The repo already ships these primitives. To re-install or pull updates from a fresh shadcn setup, run:

```bash
# init once (only if components.json is missing)
npx shadcn@latest init

# components used by this app
npx shadcn@latest add alert-dialog
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add checkbox
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add sidebar
npx shadcn@latest add skeleton
npx shadcn@latest add sonner
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add toggle
npx shadcn@latest add tooltip
```

Or in one shot:

```bash
npx shadcn@latest add alert-dialog badge button card checkbox dialog input label separator sheet sidebar skeleton sonner tabs textarea toggle tooltip
```

## Demo accounts

Password: `password123`

- `director.a1@demo.app`
- `manager.a11@demo.app`
- `employee.a111@demo.app`
