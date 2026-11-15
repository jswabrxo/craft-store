# Store administration

Open `/admin/` on the deployed site. The screen reads and writes Supabase directly using Auth and database row policies. It never receives a service-role key.

## First administrator

1. In Supabase Dashboard → Authentication → Users, create your own account using your email and a strong password. No admin account existed when this integration was created.
2. In the project SQL editor, run the following after replacing the email with that exact account. Only the project owner should run this.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"store_admin"}'::jsonb
where email = 'YOUR_ADMIN_EMAIL';
```

3. Sign in at `/admin/`. Sign out and back in after changing roles. Ordinary accounts cannot read orders or edit the catalog. Sessions are kept only in memory and expire; sign in again if a request reports an expired token.

## Daily workflow

- Select a collection, edit its copy, palette and font, save, then make it active.
- Edit product names, prices, descriptions, materials, sizing, color names and image paths.
- Publish/unpublish collections. The storefront fetches active published content every 30 seconds and on window focus.
- Review orders, update sample payment/fulfillment statuses, and save. Customers paste their private order code to retrieve status. Database audit events record changes.
- Current list shows the newest 100 orders. Larger stores need pagination and server search before launch.

## Images

Two generated sample photographs are versioned in `public/images`. Supabase product_colors and product_images store their paths and descriptions. Binary image data is not stored in Postgres. Local `/images/` paths work on Sites and Cloudflare. For independent uploads, upload to the existing public `product-images` bucket in Supabase Dashboard and enter its relative storage path in the admin color editor.

## Fonts

Built-in title families are serif, system sans and monospace. Body font and optional custom font paths are stored on each drop. Only upload font files you have permission to use on the web. Custom font URLs must use HTTPS or a same-site path.

## Deployment

Set these **build environment variables** on each host, then rebuild:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

See `.env.example`. These browser connection values are publicly visible in compiled JavaScript by design. Keep service-role, database passwords and PayMongo secret keys out of source and NEXT_PUBLIC variables.

Cloudflare Pages: connect `jswabrxo/craft-store`, production branch `main`, build command `npm run build`, output `out`. This repository is a static Next.js export. The private Sites manifest is excluded from GitHub. Connecting the GitHub repository to Cloudflare and adding its build variables is a separate hosting setup step.

Code pushes can trigger Cloudflare builds once that connection is configured. Supabase content edits appear in the running website without a GitHub commit or a rebuild. GitHub holds application code and migrations, not a live mirror of orders or customer information.

## Payment boundary

This is a database-backed **sample checkout**, not a live payment integration. It collects only a name and email, validates format, calculates prices on the database, and issues a random 128-bit private order code. It does not verify email ownership, issue a PayMongo QR, or collect money. Guest status responses contain no customer names or emails. Treat order codes as private access credentials.

Before accepting real orders: implement verified PayMongo webhooks, unique provider event IDs, amount/currency checks, idempotent payment state transitions, inventory reservation, guest email verification, abuse protection/CAPTCHA, shipping/tax rules and a retention policy. Do not treat a customer click or screenshot as payment proof.
