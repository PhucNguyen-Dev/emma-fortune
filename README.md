# Emma's Unlimited Fortune

**A little luxury today. A future we build together.**

A private, mobile-first birthday web app: a playful fictional *Birthday Bank*, an honest
*Future Fund* savings tracker, a *Rich Girl* wishlist, and a personal letter. Everything
runs locally in the browser — no backend, no accounts, no APIs, no spending of real money.

> Love points are imaginary and have **no cash value**. The Future Fund shows only amounts
> that were actually recorded as saved. Nothing is sent anywhere; all data lives in this
> browser's localStorage.

---

## Quick start

Requires Node.js 20+ (built and tested on Node 22) and pnpm.

```bash
pnpm install
pnpm dev        # development server → http://localhost:3000
```

Production:

```bash
pnpm build
pnpm start      # serves the optimized build → http://localhost:3000
```

### If the page won't load

The app only works while a server is running — a browser tab alone shows a
"can't connect" error if nothing is serving port 3000. Easiest options:

- Double-click **`Start Emmas App.bat`** in the parent folder (installs/builds on first
  run, then starts the server and opens the app). Keep its window open while using the app.
- Or run `pnpm start` (uses the existing build) or `pnpm dev` (for editing) inside
  `emma-fortune/`, then refresh the browser tab.

If a page looks wrong after the server was down, a plain refresh fixes it — the error
page is only what the browser cached while nothing was listening.

## Commands

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Run the dev server                             |
| `pnpm build`      | Production build (all routes prerender static) |
| `pnpm start`      | Serve the production build                     |
| `pnpm lint`       | ESLint                                         |
| `pnpm typecheck`  | `tsc --noEmit`                                 |
| `pnpm test`       | Unit + component tests (Vitest + RTL)          |
| `pnpm test:watch` | Vitest in watch mode                           |
| `pnpm e2e`        | Playwright E2E (runs `pnpm start` automatically; run `pnpm build` first) |

## App map

| Route        | What Emma sees                                                                 |
| ------------ | ------------------------------------------------------------------------------ |
| `/`          | Birthday greeting, first-visit celebration with confetti, module cards, letter preview |
| `/bank`      | "Unlimited Love Account" with love points, the **Unlimited Boutique** (255 shoppable treasures across ~50 item types × famous brands, prices 1,000–100,000 pts), a rare hidden treasure card, 6 redeemable experience coupons, activity feed, and coins that can fly back to the Future Fund |
| `/fund`      | A promise jar for dreams: starts at 0, contribution add/edit/delete with confirmation, progress bar, coins that can fly to the Birthday Bank, "dream came true" celebration |
| `/wishlist`  | "The Rich Girl Collection": 8 editable sample wishes, search/filter/sort, favorites, statuses (dreaming / planned / gifted), detail dialog |
| `/letter`    | Sealed envelope → the personal letter, plus a "Things I love about you" section (hidden until you fill it) |
| `/settings`  | Owner-only personalization, preview mode, export/import backup, safe resets (gear icon, top right) |

There is also a **hidden music box**: a small ♪ button in the footer. Five little
pieces — an English music-box "Happy Birthday", an Arabic maqam piece, a Chinese
guzheng miniature, a Vietnamese pop-ballad piano piece (swap in the recording you own — see below), and an ancient Middle-Eastern ney
piece — begin softly on her first touch and swell until they fill the room. She
can switch songs or pause it entirely (her choice is remembered).

## Personalize it in 10 minutes (before showing Emma)

All of this happens in **Settings** (`/settings`) — no code changes needed.

1. **Sender name** — replace the default "Your Love" with your real name or nickname.
2. **Letter** — edit the salutation, body, and sign-off so it sounds like you. The default
   text is starter copy: heartfelt but generic.
3. **The secret treasure** (Settings) — the blurred card in the Boutique is yours to
   customize: its title, its message, and how rarely it appears. At the default 0.01%
   chance it shows up on about 1 in 10,000 boutique purchases — raise the chance (e.g.
   5) if you want her to actually meet it. "Preview the reveal" shows exactly what she'll
   see; "Reset found state" hides it again.
4. **Things I love about you** — add 3–5 true things. While the list is empty it stays
   completely hidden from the letter page; switch Preview mode to "Recipient view" to
   double-check what she will see.
5. **Birthday date** (optional) — enables a "Today!" or "in N days" badge. Leave empty to hide it.
6. **Future Fund** — set a realistic target (or keep the clearly-labeled editable demo
   target). Keep saved amount at zero unless money was genuinely saved and recorded.
7. **Coupons** — edit each promise so you can sincerely deliver it. Coupon descriptions and
   fictional point costs are editable.
8. **Wishlist** — replace/remove the sample items on the wishlist page itself
   (add / edit / delete / favorite all work there).
9. **Preview on your phone** — the layout is mobile-first; open it on your phone before she does.

### Upgrading the music with your own recordings

The five built-in songs are synthesized live in the browser (the birthday melody is
public domain; the other four are original compositions in each tradition's style), so
they cost nothing and work offline. There are two ways to swap in a recording you own:

**Easiest — upload it in the app.** Settings → **The songs** → “Add a recording” next to
the song, pick your MP3, done. Recordings are stored privately in this browser
(IndexedDB, up to 25 MB each) and the music box prefers them automatically. Works on
your phone too.

**Or drop a file into the project.** Put it in `public/music/` using the track id as the
filename (no rebuild needed):

- `track-golden-candles.mp3` (English)
- `track-layali-al-anwar.mp3` (Arabic)
- `track-moonlit-peonies.mp3` (Chinese)
- `track-khuc-hat-mung-sinh-nhat.mp3` (Vietnamese — your chosen song, “Khúc Hát Mừng Sinh Nhật”)
- `track-caravan-of-stars.mp3` (Middle East)

`.m4a` and `.ogg` work too. Same hidden button, same soft-then-swelling volume. Note:
uploaded recordings live in the browser (not in app backups), and nothing here can fetch
commercial songs for you — bring a file you legitimately own (a purchase or an MP3 a
friend shares from their own library).

### Data, backup, and reset

- Everything persists in this browser's `localStorage` under the key `emma-fortune:v1`.
  It does **not** sync across devices or browsers. Clearing browser data erases it.
- **Export backup** downloads a JSON file; **Import backup** validates the file (schema
  version + shape) and asks for confirmation before replacing anything.
- Reset options are separated and all require confirmation: *Reset demo data* (restores
  sample content, keeps your personalization), narrower resets (coupons / contributions /
  wishlist), and a danger-zone *Reset all data* (factory defaults, everything erased).
- If saved data is ever unreadable, the app starts fresh from defaults, keeps a backup of
  the raw broken data under `emma-fortune:v1:corrupt-backup`, and shows a dismissible notice.

## Testing

- `tests/unit/` — fund math (totals, remaining, progress cap, surplus), amount parsing
  (zero/negative/NaN/too-large), coupon redemption (exactly one transaction, duplicate
  prevention), wishlist filter/sort/search, currency formatting (VND + USD), storage
  round-trip, corrupt/unsupported recovery, import validation.
- `tests/components/` — redemption flow with confirmation, contribution CRUD, wishlist
  create/favorite/filter/delete, letter open/re-read, settings persistence, reset
  confirmation, first-visit greeting dismissal.
- `e2e/smoke.spec.ts` — 7 Playwright scenarios: greeting + navigation, coupon redemption
  with activity record, contribution flow, wishlist flow, letter, reload persistence, and a
  no-horizontal-overflow check at 320px on every route.

## Deployment (optional)

The app is a fully static export at heart — the build prerenders every route. To share it
as a link you can deploy the production build to any free static-friendly host (Vercel,
Netlify, Cloudflare Pages, GitHub Pages via an adapter):

```bash
pnpm build && pnpm start   # or connect the repo to your host of choice
```

**Privacy note for a deployed link:** a public URL can be opened by anyone who has it.
That's fine for a playful gift, but do not describe it as private or password-protected —
there is no access control, by design. All Emma's data still stays in *her* browser only;
nothing is uploaded anywhere.

## Tech notes

- **Next.js 16 (App Router) + React 19 + TypeScript**, Tailwind CSS v4 with a custom
  ivory/plum/rose/champagne token palette, Lucide icons, Zod validation.
- **`phasma-ui`** (referenced by the spec) does not exist publicly (npm and GitHub both
  404), so styling is Tailwind + small hand-rolled accessible primitives
  (Radix-based dialog for focus trapping / Escape / aria wiring).
- State lives in one typed, Zod-validated document (`AppState`, schema version 1) behind a
  repository layer (`lib/storage/repository.ts`); components never touch localStorage
  directly. Hydration happens after mount to avoid SSR mismatches, and `storage` events
  keep multiple tabs in sync.
- Fonts are self-hosted at build time (Playfair Display + Inter) with system fallbacks.
- Motion respects `prefers-reduced-motion` (and a settings toggle); confetti only fires on
  first visit or explicit "mark as reached" confirmation.
- Deliberately omitted: photo uploads (base64 images would risk blowing the localStorage
  quota), any checkout/payment concept, and any currency conversion (changing currency
  changes display only).

## Project structure

```
app/                  # routes: /, /bank, /fund, /wishlist, /letter, /settings
components/
  app-shell/          # provider wiring, top bar, nav, footer, toasts
  overview/ bank/ fund/ wishlist/ letter/ settings/
  ui/                 # button, card, dialog, form fields, progress, confetti…
lib/
  config/defaults.ts  # all sample content (coupons, wishlist, letter, fund goal)
  formatting/         # Intl currency/number/date helpers
  state/              # AppStateProvider (reducer + persistence + storage events)
  storage/            # versioned localStorage repository, import/export validation
  utils/              # fund math, bank logic, wishlist filtering
  validation/         # Zod schemas
types/                # shared TypeScript types
tests/                # unit + component tests
e2e/                  # Playwright smoke tests
```
