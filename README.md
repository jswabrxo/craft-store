# ODD OBJECTS / Drop 01

Low-fidelity Cloud Rack prototype. Next.js App Router, TypeScript, Tailwind CSS, npm. All six items and peso prices are sample data. The wishlist uses React state and survives navigation between the rack and product pages, and clears on refresh. No checkout, payments, accounts, database, or analytics.

## Local setup

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev`. Open http://localhost:3000. No environment variables are needed; `.env.example` reserves public placeholders for later integration.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`

The build exports `out/` for static hosting. Routes: `/`, `/products/static-loop/` (and five other sample slugs), `/api/health/`. The health route returns build-time JSON; it does not test a running backend or database.

## Scope and next steps

This milestone intentionally uses static export, suitable for Sites or Cloudflare static assets. Future preorder submission and private administration require server runtime configuration before implementation. Payment status must only change after manual verification against the merchant's GCash transaction records, never from an uploaded screenshot or customer-entered reference alone. Never put service-role keys in browser code.

Source is stored in the Sites-managed Git repository for this draft. A user-owned GitHub repository and Cloudflare production deployment are not configured.

## Phone test

1. Can a new visitor identify bracelets and keychains within five seconds?
2. Tap Browse Drop 01 and find Static Loop's sample price (₱180).
3. Save two pieces. Confirm both wishlist counts say 2 and the tray lists the pieces.
4. Remove one using its card, and the other using the tray. Confirm the count returns to 0.
5. Save again and refresh. Confirm the tray clears.
6. Check at 320–430px widths: no sideways scrolling, readable prices, easy-to-tap buttons.

## Assumptions

Two products per mobile shelf; four bracelets and two keychains; illustrative prices; in-memory wishlist; minimal product detail route to satisfy the technical milestone. Draft remains unpublished.
