# Check Voucher System

Multi-user check voucher app for J²M Lending Investor Inc. Loan numbers are
assigned automatically from a shared counter the moment a user clicks
**New Transaction**, so several staff members can work at the same time and
never receive the same number. Completed vouchers are saved to a shared,
searchable History.

Built with React + Vite. The shared database is Supabase (free tier).

## Run it on your computer

```
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Until the database is connected, the app runs in **DEMO MODE** (yellow banner
at the top): everything works, but numbers and history live in that one
browser only. Good for trying it out — not for the office.

## Connect the database (one-time, ~10 minutes)

1. Go to https://supabase.com and create a free account, then click
   **New project**. Give it a name (e.g. `check-vouchers`), set a database
   password (save it somewhere), and pick a region close to you.
2. When the project finishes setting up, open **SQL Editor** in the left
   sidebar, click **New query**, and paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql). Click **Run**. You should see
   "Success. No rows returned".
3. In the left sidebar open **Project Settings → API**. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)
4. Open [`src/config.js`](src/config.js) in this project and paste them
   between the quotes:

   ```js
   export const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJ...';
   ```

5. Restart `npm run dev`. The yellow demo banner should be gone. Done —
   every computer that opens the site now shares the same loan numbers and
   history.

## Turn on the office password (recommended)

One shared password for all staff — no individual accounts. The database
refuses every request from anyone who hasn't entered it, so it protects
work-from-home use too.

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
   - Email: `office@jrm-vouchers.app` (must match `OFFICE_EMAIL` in `src/config.js`)
   - Password: the office password you choose
   - **Auto Confirm User: checked**
2. SQL Editor → run the whole of
   [`supabase/enable-password-lock.sql`](supabase/enable-password-lock.sql).
3. Done. The app now shows a password screen on first use per device.

To change the password later: Authentication → Users → click the office
user → Reset password.

## Set the starting loan number

When the client tells you their current number (e.g. `JRM26-5257`):

1. Open the app → **Settings**.
2. Prefix: `JRM26` — Last issued number: `5257`.
3. Save. The next voucher will be `JRM26-5258`.

At New Year (or whenever the prefix changes), come back to Settings and
update the prefix the same way.

## Put it online for the office

The app is a static website, so GitHub Pages works (same as the budget
tracker project):

```
npm run deploy
```

This builds the app and publishes the `dist` folder to a `gh-pages` branch.
In the GitHub repository settings, enable Pages from the `gh-pages` branch.
Share the resulting URL with the office.

Note: there are no logins — anyone who has the URL can create vouchers, so
only share it within the office.

## How the "no duplicate numbers" guarantee works

- Clicking **New Transaction** calls a Postgres function
  (`reserve_loan_number` in `supabase/schema.sql`) that increments the
  counter inside a single atomic UPDATE. Two users clicking at the same
  moment are served one at a time by the database, so each gets a
  different number.
- Numbers are reserved immediately — never generated at print time.
- Abandoned numbers (user closes the page) are simply skipped, never
  recycled. Gaps are normal and acceptable; duplicates are impossible.
