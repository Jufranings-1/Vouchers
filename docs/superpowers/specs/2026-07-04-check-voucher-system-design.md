# Check Voucher System — Design

Date: 2026-07-04
Client: J²M Lending Investor Inc. (via user)

## Goal

A multi-user check voucher web app. Loan numbers are assigned automatically
from a shared counter, reserved atomically the moment a user clicks New
Transaction. Duplicates are impossible; gaps are acceptable; numbers are
never recycled. All other fields are manual.

## Decisions made during brainstorming

- **Multiple computers, simultaneous use** → a shared backend is required.
  Chosen: Supabase free tier (Postgres). No server to maintain; free tier
  holds decades of voucher text data (~1 KB per voucher vs 500 MB limit).
- **Every completed voucher is saved** to the database → shared History
  screen with search (loan number / borrower) and reprint. A Download
  button also saves a self-contained HTML copy of a voucher locally.
- **No logins.** "Prepared By" is typed manually. Anyone with the URL can
  use the system (office-internal).
- **Loan number format** `JRM26-5257`: prefix + counter are stored in a
  settings row and editable from a Settings screen. Client's current number
  is unknown yet; user will set prefix + last number once, and again at
  year rollover. No automatic year logic.
- **Print layout**: full voucher printed on blank paper, matching the
  provided reference image (logo, Pay to, Loan No./Date box, Particulars
  table, Distribution of Account, Pesos-in-words box, signature boxes).

## Architecture

React + Vite static frontend (deployable to GitHub Pages) + Supabase.

- `voucher_counter` table (single row: prefix, last_number) +
  `reserve_loan_number()` Postgres function — atomic UPDATE hands out
  numbers; row lock serializes concurrent users.
- `vouchers` table — one row per completed voucher, upserted by
  loan_number on Print and on Next Transaction.
- Demo mode: when `src/config.js` has no Supabase credentials, the same
  API is served from localStorage (single-browser), with a warning banner.

## Screens

1. **New Voucher** — form (loan number read-only) + live preview.
   [New/Next Transaction] confirms, saves current voucher, reserves next
   number, clears form. [Print] saves then opens print dialog (form kept).
   [Download] saves standalone HTML copy.
2. **History** — search + table + view modal with Print/Download.
3. **Settings** — prefix and last issued number.

## Refinements vs the reference image

- Cash in Bank auto-calculates (Loan Amount − Processing Fee − Loan
  Balance − Misc.) but stays editable; Amount in Words auto-generates from
  Cash in Bank, also editable.
- In the reference image, Processing Fee (80.00) sits in the DEBIT column,
  yet the totals (2,000 / 2,000) only balance if it is a CREDIT. The app
  places fee / loan balance / misc. / cash in bank in the credit column so
  totals balance. **To confirm with the client's bookkeeper.**

## Open items

- Client's actual current loan number (entered later via Settings).
- Whether the year in the prefix rolls over with or without a counter
  reset (Settings handles either manually).
- Bookkeeper confirmation of debit/credit columns (above).
