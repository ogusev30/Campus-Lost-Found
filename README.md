# Campus Lost & Found

A shared campus lost-and-found board built with Next.js (App Router) and Supabase.

- **Student 1 — Report & Manage** (`student1` branch): login, report items, manage own listings, review and accept/reject claims.
- **Student 2 — Discover & Claim** (`student2` branch): browse/search items, view item detail, send and track claims.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Supabase project, then copy `.env.local.example` to `.env.local` and fill in your project's URL and anon key.
3. In the Supabase SQL editor, run the files under `supabase/` in order:
   1. `schema.sql`
   2. `rls_student1.sql`
   3. `rls_student2.sql`
4. Run the dev server:
   ```
   npm run dev
   ```

`.env.local` is gitignored and must never be committed.
