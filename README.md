# Expo Sales Tracker (POS)

An offline-first Japanese Expo Sales Tracker for staff selling merchandise at cultural expos.
Built with React 19, TypeScript, Tailwind v4, Framer Motion, TanStack Query, and Zustand.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production bundle in `dist/`.

## What's fully built

- **Screens**: Splash, Onboarding, Dashboard, Products (grid + search + category filters),
  Product Details, Cart Drawer, Checkout, Order Success, Orders (search/filter/expandable
  receipts), Analytics, Settings, 404, and empty states throughout.
- **Architecture**: feature-based (`src/features/<feature>/{components,hooks,api,types}`),
  a single backend abstraction (`src/services/googleSheets.ts`) that the rest of the app
  calls exclusively, Zustand stores for cart/network/settings/toasts, TanStack Query for
  server state, React Router for navigation, IndexedDB (via `idb`) for the offline order queue.
- **Design system**: tokens in `src/index.css` matching the brief exactly — colors, 24/20/18px
  radii, soft/card/lift shadows, Noto Sans JP + Inter — plus a reusable UI kit
  (`src/components/ui`) and shared building blocks (empty states, toasts, animated counters,
  confetti, sakura petals, sync status badge).
- **Offline flow**: sales are always written to IndexedDB first; `useNetworkSync` listens for
  the browser's online/offline events and calls `syncPendingOrders()` automatically when the
  connection returns, with a toast and pending-count badge.

## Connecting the real backend

Everything currently runs against realistic mock data + `localStorage`/IndexedDB so the app is
fully usable standalone. To go live:

1. Deploy a Google Apps Script Web App exposing the sheet-backed endpoints your `googleSheets.ts`
   already expects (`getDashboard`, `getProducts`, `createOrder`, `getOrders`, `getAnalytics`).
2. Copy `.env.example` to `.env` and set `VITE_APPS_SCRIPT_URL` to the deployed script URL.
3. In `src/services/googleSheets.ts`, flip `USE_LIVE_BACKEND` to `true`.

No other file needs to change — every feature calls the service layer, never Sheets directly.
Migrating to Firebase later means rewriting the bodies of the functions in `googleSheets.ts`
(or adding a sibling `firebase.ts` and swapping the import) — the rest of the app is unaffected.

## Known gaps / next steps

This is a strong, working foundation rather than a fully exhaustive implementation of every
micro-interaction in the brief. Notably still open:
- Product images are placeholder Unsplash URLs, not real Google Drive-hosted assets — swap
  `imageUrl` values once real Drive links exist (lazy-load + blur placeholder wiring is ready).
- The "product flies into cart" and ripple effects are implemented as simpler check/scale
  micro-interactions rather than a literal flying-image animation.
- React Hook Form + Zod are installed but the checkout form currently uses local component
  state; wiring RHF/Zod validation onto it is a quick follow-up.
- No automated tests yet.
- Bundle isn't code-split beyond route-level `lazy()`; recharts pulls in a large chunk on the
  Analytics/Dashboard routes (flagged by the build, not an error).
