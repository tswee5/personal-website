# Personal Website

A Next.js personal knowledge garden, portfolio, and publishing platform.

## Stack

- Next.js App Router
- TypeScript
- Tailwind
- MDX-ready editor surface
- Supabase Auth, Database, and Storage scaffolding
- Postgres full text search schema

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add Supabase credentials before wiring live data.

## Supabase

Run `supabase/schema.sql` in a Supabase SQL editor or migration. After creating your owner user through email login, set `profiles.is_owner = true` for that account.

If you already ran an older version of the schema before the admin login trigger was added, run `supabase/admin_upgrade.sql` once.

If you already have the database installed and want the Reading triage fields, run `supabase/reading_triage_upgrade.sql` once.

## Admin Flow

1. Add Supabase env vars to `.env.local`.
2. Start the app with `npm run dev`.
3. Visit `/admin`.
4. Send yourself the email magic link.
5. In Supabase, set your row in `profiles` to `is_owner = true`.
6. Return to `/admin` to create, save, publish, and delete content.

Published content is read from Supabase by the public pages. When Supabase is not configured, the site falls back to sample content from `lib/content.ts`.

## Writing Via Substack

Writing is not edited in the admin portal. Add one of these to `.env.local`:

```bash
SUBSTACK_PUBLICATION_URL=https://your-publication.substack.com
```

or:

```bash
SUBSTACK_FEED_URL=https://your-publication.substack.com/feed
```

The site renders Substack posts natively at `/writing` and `/writing/[slug]`.

## Pages

- `/`
- `/about`
- `/projects`
- `/writing`
- `/reading`
- `/interests`
- `/search`
- `/admin`
