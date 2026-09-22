# Tourify

Smart Tourism E-Ticketing for discovering Indonesian destinations, booking tickets, and entering with a secure QR e-ticket. The responsive UI translates the supplied Tourify mobile identity into a desktop-first booking experience.

## Included

- React + Vite frontend with responsive desktop/mobile navigation
- Express REST API, JWT authentication, bcrypt password hashing, and role checks
- Supabase PostgreSQL schema and five seeded destinations
- Destination search, filtering, booking, secure QR ticket generation, ticket history, and print view
- Admin dashboard, booking/user lists, destination deletion, and server-validated check-in flow

## Setup

1. Create a Supabase project. Run [`supabase/schema.sql`](./supabase/schema.sql), then [`supabase/seed.sql`](./supabase/seed.sql) in its SQL editor.
2. Copy `.env.example` to `.env` and fill in the Supabase URL, **service role key**, and a long random `JWT_SECRET`. Never expose the service role key in `client`.
3. Install and run:

```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

## Roles

New registrations are always `user`. To enable the admin dashboard, update a trusted account in Supabase:

```sql\
update users set role = 'admin' where email = 'your-admin@email.com';
```

## Main routes

`/`, `/destinations`, `/destinations/:slug`, `/login`, `/register`, `/tickets`, `/profile`, and `/admin`.

## API notes

All bookings use the current server-side destination price; client prices are never trusted. QR payloads contain a random UUID token. Ticket validation and check-in require an authenticated admin and are performed by the Express API.

## Deploy to Vercel with your domain

The repository includes `vercel.json` and `api/index.js`, so Vercel serves the Vite app and Express API from one deployment. Import this repository in Vercel, leaving the Root Directory as the repository root. Vercel will run `npm run vercel-build`.

In **Project Settings → Environment Variables**, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a long random `JWT_SECRET`. Set `CLIENT_URL` to your production origins, for example `https://yourdomain.com,https://www.yourdomain.com`.

Then in **Project Settings → Domains**, add both `yourdomain.com` and `www.yourdomain.com`. At your domain registrar/DNS provider, point the root (`@`) A record to `76.76.21.21`, and point `www` to the exact CNAME Vercel gives you (commonly `cname.vercel-dns-0.com`). Choose one as primary and redirect the other to it. Vercel provisions HTTPS after DNS verifies.
