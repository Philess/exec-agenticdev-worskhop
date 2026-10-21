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
- The shop as the default page, with an **Admin login / Logout** simulation.
- A single read-only admin page showing raw fictional sales data, ready for the lab.
- Storage and dataset unit tests and a GitHub Actions check for tests and production builds.

**Add to Cart** and **Preview** are deliberately disabled workshop placeholders.
There is no checkout, payment processing, audio playback, or album editor yet.
Prices are illustrative USD amounts; this is not a production store.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact dependencies from the lockfile |
| `npm run dev` | Start the frontend development server |
| `npm test` | Run the storage and dataset unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run data:generate` | Rebuild the fictional two-year sales JSON with a fixed random seed |
| `npm run data:check` | Check that the committed sales JSON matches the generator |
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

## Admin mode: the workshop starting point

The app opens on the shop. Click **Admin login** to simulate an admin connection:
the shop is replaced by a single **Workshop data** page. **Logout** returns to
the shop. The mode lives only in memory; refreshing starts on the shop again.
There are no credentials, sessions, backend, or real access controls. The bundled
fictional dataset is public; this toggle must never be treated as authentication.

The admin page deliberately contains no dashboard, charts, KPIs, customer insights,
or management actions. Its banner, typography, purple-blue background and light
data panel follow the shop's existing theme. Select metadata, albums, stores and the online shop,
customers, seasonal events, or orders to inspect their raw JSON. Collections are
paged in batches of 25 records so every record is accessible without rendering
thousands of orders at once. Switching collections starts on the first page.
Building the seller dashboard and its analytics is the workshop task, not a
prebuilt feature of this starter.

**This is a read-only demo, not live commerce analytics or an authenticated seller
portal.** `src/data/sales.ts` loads `src/data/sales.json`: deterministic fictional
completed orders for January 1, 2024 through December 31, 2025 (731 days including
leap day), ten fictional physical stores, one online shop, and 600 pseudonymous
listeners. No external services, tracking, personal data, or
analytics localStorage keys are used. Sales keep historical album title/artist
and price snapshots based on the `Album` contract; they are deliberately independent
of edits, removals, or resets of the browser's saved album collection.

### Two-year sales JSON

`src/data/sales.json` is the checked-in, standalone dataset for offline analysis.
It contains 9,937 completed orders and 30 fictional albums: 22 already on sale
at the beginning of 2024, and four launches in each of 2024 and 2025. The first
six album IDs match the storefront samples; the additional historical catalog
does not replace or modify the browser's saved collection.

| JSON collection | Key fields and joins |
| --- | --- |
| `metadata` | Inclusive date bounds, USD currency, UTC dates, fixed seed, model assumptions and limitations |
| `albums` | `id`, title, artist, price in dollars, local cover, genre, seasonal `tags`, `releaseDate`, `saleStartDate` |
| `locations` | `id`, name, `channel` (`store` or `online`), fictional region, `openedOn` |
| `customers` | Pseudonymous `id`, region, `homeStoreId` -> location, `joinedOn`, preferred genre and channel |
| `events` | `id`, name, inclusive dates, matching `albumTag`, synthetic demand multiplier |
| `orders` | Unique `id`, UTC date, `customerId`, `locationId`, calendar `eventIds`, and item `lines` |
| `orders[].lines` | Historical product ID/title/artist, positive integer quantity and integer USD `unitPriceCents`; product ID joins to `albums.id` |

Release dates and first on-sale dates are distinct. No order predates an album's
on-sale date, a customer's joining date, or a store's opening date. Customers can
return, buy across channels and visit stores outside their home region; baskets
can include several albums. Preferred genres/channels and home stores influence,
but do not dictate, simulated purchasing.

Seasonality repeats in both years, with nonzero off-season demand:

| Album tag | Inclusive annual peak window | Modeled demand multiplier |
| --- | --- | --- |
| `christmas` | November 1 - December 31, after Halloween | 16x |
| `love` | February 1 - February 14, Valentine's gifting | 12x |
| `summer` | June 1 - August 31 | 3.5x |
| `halloween` | October 1 - October 31 | 9x |
| `study` | August 15 - September 30, back to school | 5x |

For example, **Everything I Wish for Christmas** by **Holly Lanterns** is a
fictional holiday-pop title, not a real artist's recording. Compare daily units
for established albums during and outside their tagged event windows, then
group by year, channel, store, or customer cohort. Normalize by days in each
window rather than comparing raw totals for unequal periods. Launches have a
28-day boost; weekends, second-year growth, and a gradual year-to-year online
mix change add other modeled effects. Random variation and mixed baskets mean
observed sales ratios will not equal the input multipliers.

Event IDs label the calendar window for an order, **not its proven cause**.
These are deliberately designed correlations in synthetic data, not evidence of
real purchasing behavior. The generator uses the largest matching seasonal
multiplier for overlapping album tags. Tests measure seasonal unit-sales lifts
in each year and channel, as well as references, dates, launches and totals.
Run `npm run data:generate` after editing `scripts/generate-sales-data.mjs`, then
`npm run data:check`, `npm test`, and `npm run build`. The generator has no external
dependencies and reproduces the same JSON byte-for-byte.

Suggested metric definitions for the dashboard exercise (not implemented):

- Gross product sales sum quantity times recorded unit price, using integer USD
  cents. Taxes, shipping, discounts, and refunds are not modeled.
- Average order value is selected product sales divided by selected orders.
  Multi-product orders count once overall and once for each product they contain.
- Active customers are unique purchasers in the selection. Returning customers
  have a purchase before the selected start date anywhere in the available demo
  history, including channels outside the selection. "New" is relative to this
  limited history, not proof of a first-ever purchase.
- Purchase frequency groups use 1, 2, or 3+ selected orders. Channel preference
  compares selected online/store order counts; a tie is labeled "Both channels".
  Filtering to one channel necessarily changes this result.
- All dates are inclusive UTC calendar dates. When building daily charts, include
  zero-sales days. Round percentages for display; do not infer real-world growth,
  profit, or lifetime-value claims from this synthetic dataset.

## Code map

```text
src/
  App.vue                        Shop, simulated admin toggle, storage and reset
  main.ts                        Vue entry point
  components/AlbumCard.vue       Album presentation and exercise placeholders
  components/AdminDataView.vue   Plain, paginated raw JSON inspection
  data/albums.ts                 Fresh sample collection factory
  data/sales.ts                  Typed, independent copies of the sales fixture
  data/sales.json                Two-year detailed sales, catalog and dimensions
  data/sales.test.ts             Integrity, launch dates and seasonal-lift checks
  services/albumStorage.ts       Validated localStorage reads and writes
  services/albumStorage.test.ts  Seeding, persistence, reset, and failure tests
  types/album.ts                 Shared Album interface
  types/sales.ts                 Sales dataset, location and customer contracts
public/album-cover.svg           Bundled cover and fallback image
scripts/generate-sales-data.mjs  Seeded, reproducible sales JSON generator
.github/workflows/ci.yml         Automated tests and build
```

## Suggested workshop exercises

1. Inspect the raw data in admin mode and identify the relationships between orders, albums, customers, stores and events.
2. Build the seller dashboard: date and channel filters, revenue, units, order counts and product rankings.
3. Add physical-store versus online comparisons and customer management views.
4. Explore seasonal patterns and album launches across the two years, with tests for your calculations.

Ask your coding agent to inspect the relevant components, propose a small change,
implement it, and verify its behavior. Keep changes frontend-only and cover storage
edge cases as the app grows.
