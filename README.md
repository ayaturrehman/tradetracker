## TradeTracker Overview

TradeTracker is a full-stack Next.js platform that helps discretionary and systematic traders connect broker accounts, import executions, and visualise performance. The stack includes:

- **Next.js App Router** with React Server Components
- **NextAuth** for authentication and session management
- **Prisma + PostgreSQL** for persistence
- **Stripe** billing hooks (in progress)
- **Tailwind CSS (v4)** + shadcn-inspired UI components

## Local Development

```bash
# install dependencies
npm install

# run database migrations (requires DATABASE_URL in .env)
npm run prisma:migrate -- --name init

# start the dev server
npm run dev
```

Copy `.env.example` to `.env` and update the secrets before running the stack.

### PostgreSQL Quickstart

```bash
docker run --name tradetracker-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tradetracker \
  -p 5432:5432 -d postgres:16
```

Then set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradetracker?schema=public"` in `.env`.

## CSV Import Pipeline

TradeTracker can parse CSV exports from multiple brokers/exchanges without manual header editing. The parser lives in `src/lib/imports/csv.ts` and supports alias matching for symbol, side, quantity, price, PnL, and timestamps.

### Preview Endpoint

`POST /api/imports/preview`

```json
{
  "csv": "symbol,side,quantity,open date,open time,pnl\nESZ4,Buy,1,2024-10-01,09:32,-125.5",
  "delimiter": ",",
  "decimalSeparator": ".",
  "previewLimit": 50
}
```

Response:

```json
{
  "data": [
    {
      "symbol": "ESZ4",
      "side": "LONG",
      "quantity": 1,
      "profitLoss": -125.5,
      "openedAt": "2024-10-01T09:32:00.000Z",
      "alreadyExists": false,
      "raw": {
        "symbol": "ESZ4",
        "side": "Buy",
        "quantity": "1",
        "open date": "2024-10-01",
        "open time": "09:32",
        "pnl": "-125.5"
      }
    }
  ],
  "skipped": [],
  "headerMapping": {
    "symbol": "symbol",
    "side": "side",
    "quantity": "quantity",
    "open date": "openedAtDate",
    "open time": "openedAtTime",
    "pnl": "profitLoss"
  },
  "unknownHeaders": [],
  "warnings": []
}
```

The endpoint requires an authenticated session and only returns the first `previewLimit` trades to keep payloads manageable. Unknown headers and skipped rows are surfaced so brokers with exotic CSV formats can be mapped quickly.

Every preview now checks for trades that already exist in the selected account (matching `externalId` when available, otherwise symbol + side + openedAt + entry price + quantity). Duplicates appear in the response with `alreadyExists: true` so you can skip them before final ingestion.

### Persisting Imports

- Upload the raw CSV to storage (S3, Supabase) and create an `ImportFile` via `POST /api/imports`.
- Take the parsed payload from `/api/imports/preview`, enrich it with account IDs, and push to a background job that inserts records into the `Trade` table (dedupe using `externalId` + account).
- Sync results back to `SyncLog` for user visibility.

For small batches you can call `POST /api/imports/process` directly with the preview payload. The route validates ownership, skips trades that already exist, and inserts the remainder in one transaction.

Front-end components should call the preview endpoint immediately after a user selects a file to show a mapping summary and allow them to tweak column assignments if needed.

## Next Steps

- Wire Stripe Checkout + customer portal.
- Build the CSV upload UI and connect it to the preview/import endpoints.
- Implement background workers (BullMQ/Upstash) to process large CSVs and API syncs without blocking requests.
# tradetracker
