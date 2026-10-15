# Agentic Development Workshop Starter

A frontend-only album collection app for hands-on agentic development workshops.
Adapted from the Vue frontend in [Philess/gh-copilot-demo](https://github.com/Philess/gh-copilot-demo).
This repository intentionally contains **no backend, database server, Azure infrastructure, or API integration**.

## Quick start

Install [Node.js 22 or newer](https://nodejs.org/) (npm is included), then:

```sh
git clone https://github.com/Philess/exec-agenticdev-worskhop.git
cd exec-agenticdev-worskhop
npm ci
npm run dev
```

Open the local URL printed by Vite (normally **http://localhost:3001**).
No environment variables, credentials, .NET SDK, or cloud resources are needed.
Package installation needs internet access; the running app and its bundled cover image do not.

## What is included

- Vue 3 Composition API, TypeScript, and Vite.
- The original responsive album grid and cards.
- Six fictional sample albums, automatically initialized on the first visit.
- Browser localStorage persistence, validation, and explicit storage error messages.
- A confirmed **Reset demo data** action to restore the initial collection.
- Storage unit tests and a GitHub Actions check for tests and production builds.

**Add to Cart** and **Preview** are deliberately disabled workshop placeholders.
There is no checkout, payment processing, audio playback, or album editor yet.
Prices are illustrative USD amounts; this is not a production store.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact dependencies from the lockfile |
| `npm run dev` | Start the frontend development server |
| `npm test` | Run the storage unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Check Vue and TypeScript types |
| `npm run build` | Type-check and create the static production build in `dist` |
| `npm run preview` | Serve the production build locally after building |

Deploy `dist` to any static web host. Serve the app over HTTP(S), not by opening
`index.html` as a file. The default build targets the root of a site; for a subpath,
build with `npm run build -- --base=/your-subpath/`.

## How data works

`src/data/albums.ts` defines the seed collection. On first load,
`src/services/albumStorage.ts` writes it to the localStorage key
`exec-agenticdev-workshop.albums.v1`. Subsequent loads read the saved collection
instead of overwriting it, including when it is intentionally empty.

The stored JSON has this shape:

```json
{
  "version": 1,
  "albums": [
    {
      "id": 1,
      "title": "Midnight Signals",
      "artist": "The Northern Lights",
      "price": 12.99,
      "image_url": "/album-cover.svg"
    }
  ]
}
```

Album IDs must be unique positive safe integers; titles, artists, and image URLs
must be nonempty strings; prices must be finite nonnegative numbers.
`loadAlbums`, `saveAlbums`, and `resetAlbums` are the persistence entry points
to reuse when implementing workshop features. A future editor should save successfully
before updating displayed state, and surface save failures to the user.

Data belongs to this browser profile and origin (scheme, hostname, and port).
Development and preview servers use different ports and therefore different collections.
It is not shared across users or devices. Clearing site data removes it; private browsing
may discard it on exit, and browser settings can block writes. Do not store secrets or
personal data here. Cross-tab live synchronization is not implemented.

Use **Reset demo data** and confirm to restore the samples. This replaces only the
app's collection key, not other localStorage data. Invalid JSON or unsupported data
is reported without being silently overwritten; reset is the explicit recovery path.
If browser storage is blocked or full, allow it or free space before retrying.
Changes to seed data take effect for existing users only after a reset.

## Code map

```text
src/
  App.vue                        Loading, errors, collection display, and reset
  main.ts                        Vue entry point
  components/AlbumCard.vue       Album presentation and exercise placeholders
  data/albums.ts                 Fresh sample collection factory
  services/albumStorage.ts       Validated localStorage reads and writes
  services/albumStorage.test.ts  Seeding, persistence, reset, and failure tests
  types/album.ts                 Shared Album interface
public/album-cover.svg           Bundled cover and fallback image
.github/workflows/ci.yml         Automated tests and build
```

## Suggested workshop exercises

1. Add title/artist search and sorting while preserving the saved collection.
2. Build an album editor using `saveAlbums`; add validation and persistence tests.
3. Implement a local cart, using a separate storage key and no real payments.
4. Replace the disabled preview action with an accessible album-details dialog.

Ask your coding agent to inspect the relevant components, propose a small change,
implement it, and verify its behavior. Keep changes frontend-only and cover storage
edge cases as the app grows.
