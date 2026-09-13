# Ochag — Customer Ordering Flow

A working MVP of the Ochag customer ordering flow: browse the menu, search,
build a cart, check out, and track an order. The MVP uses local sample data and
`localStorage`, so it runs without Supabase or environment variables.

## What's implemented

- **Routing**: `/`, `/restaurant`, `/menu`, `/menu/:category`, `/product/:id`,
  `/search`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/account`,
  `/addresses`, `/login`, `/register`, `/forgot-password`.
- **i18n**: Russian (default), Kazakh, English via `react-i18next`. Language
  persists in `localStorage` and never resets cart, checkout, or auth state.
- **Cart**: persists in `localStorage` across refresh/navigation/language
  switches. Cleared only after a successful order.
- **Checkout → local order creation**: creates an order in `localStorage` and
  redirects to its tracking page without requiring a backend.
- **Order tracking**: `/orders/:id` displays the locally saved order and its
  status timeline.
- **Guest checkout**: no login required to order; the order confirmation
  redirects straight to `/orders/:id`, which works for guests because that
  order's `id` is an unguessable UUID (see RLS notes below).
- **Auth**: local demo login/register state stored in `localStorage`.

## What's intentionally NOT built yet

Per the phased brief, this slice stops after checkout + tracking. Not
included: admin panel, courier app, promotions/promo codes, ratings,
notifications, payment gateway integration (Kaspi/card charges are recorded
as `pending`/`cash`, never marked `paid` without a real payment event),
delivery-zone polygon/map matching (a flat per-zone fee is used as a
placeholder — see `TODO` in `Checkout.tsx`), SEO metadata, and the
`/ru /kk /en` URL-prefixed routing structure (language currently lives in
state/localStorage, not the URL — straightforward to add later with
`react-router` layout routes if you want SEO-indexable language paths).

## Getting started

### 1. Run it

```bash
npm install
npm run dev
```

For the 2GIS address picker, create `.env.local` from `.env.example` and put
your 2GIS API key into `VITE_2GIS_API_KEY`. The key is used only in the
browser to load MapGL and should not be committed to Git.

Open the `http://localhost:5173/` URL printed by Vite. Do not open
`index.html` directly from File Explorer: `file://` does not support Vite's
`/src/main.tsx` module path and the browser will block it with a CORS error.

### Automatic public deployment

Every push to `main` automatically deploys the app to GitHub Pages:

`https://aldiyar1yelemanov.github.io/PWatermelon_Chicken_Basketball_Club/`

For the map on the public site, add a repository secret named
`VITE_2GIS_API_KEY` in **Settings → Secrets and variables → Actions**. The
workflow passes it into the Vite build automatically.

The Supabase schema and seed files are kept for the later production
integration, but they are not needed for the MVP.

### 4. Try the flow

1. Open the app — local sample menu items should load (Russian by default).
2. Switch language with RU/KZ/EN in the header — product names/descriptions
   change; your cart (if any) is untouched.
3. Add a few items, go to `/cart`, then `/checkout`.
4. Fill in delivery details and place the order — this saves the order locally.
5. You land on `/orders/:id` and can view the order status timeline.

## Notes on production-readiness

- **Persistence**: local orders, demo auth, and cart state are stored in the
  browser's `localStorage` for this MVP.
- **Delivery fee/zone matching** in `Checkout.tsx` currently just takes the
  first active `delivery_zones` row for the branch. Replace with real
  point-in-polygon or radius matching once addresses have coordinates (e.g.
  via a geocoding step when the user enters their street).
- Replace the `image_url` placeholders in `03_seed.sql` with real Ochag food
  photography before launch.
