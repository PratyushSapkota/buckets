# Spreadsheet

## Behavior

The OAuth callback calls `ensureWorksheet(sub)` after Google identity and email-whitelist verification, before changing application sessions. The worksheet title exactly matches the verified Google sub. Browser-supplied subjects or worksheet IDs are not accepted.

Redis stores `worksheet:<spreadsheetId>:<sub> → numeric worksheet ID as a string` without expiration. This mapping is independent of session keys and survives logout. Valid cached IDs are trusted without contacting Sheets; ID 0 is valid. Malformed mappings are treated as cache misses.

On a cache miss, the service reads only worksheet title/ID metadata. A matching title is reused. Otherwise one atomic batchUpdate creates the worksheet, writes its four entity header ranges, and initializes an expanding account-balance formula and defines an account/category SUM pivot. A random numeric sheet ID is specified up front so every request in the batch targets the newly added worksheet. The returned ID is cached only after creation succeeds. No entity records or application metadata are written.

This assumes fresh creation. Existing worksheets, including empty ones, are reused without migration or schema repair.

## Schema

Headers occupy row 1; entity records begin on row 2. Columns between ranges are left empty, allowing each range to grow downward independently.

| Area | Columns / anchor | Headers or calculation |
| --- | --- | --- |
| Buckets | A:C | id, name, archived |
| Categories | E:F | id, name |
| Accounts | H:L | id, name, bucketId, archived, balance |
| Transactions | N:R | id, date, amount, accountId, categoryId |
| Account balances | L2:L | MAP/SUMIF formula sums transaction amounts for each account ID |
| Account/category totals | W1 (W:Y) | Group accountId and categoryId; SUM amount |

The new grid has 1,000 rows and 25 columns. The account/category pivot source includes transaction headers and all transaction rows, with no fixed ending row, so later grid expansion remains supported. Rows without an accountId are filtered out; blank categoryId values remain included. Group totals are disabled and repeated account headings are enabled for flat lookup results. Headers are literal strings, without custom formatting. L2 contains a MAP/LAMBDA/SUMIF formula over H2:H, matching transaction account IDs in Q2:Q and summing amounts in P2:P. Empty account rows remain blank; accounts without transactions return zero. L2:L is reserved for formula output: future account writes must target H:K and preserve L2. T:V is unused. Sheet growth and entity writes are outside this step.

If creation throws or returns an invalid ID, metadata is read again to recover concurrent creation or a lost response. If the exact title still cannot be resolved, login fails. There is no automatic retry of the creation request. If Redis caching fails after creation, the next login discovers and reuses that worksheet.

Redis failures preserve their controlled unavailable error. Other configuration, credential, API, and response failures become SpreadsheetError with no upstream details. A failed resolution does not issue a session or invalidate an existing session. Manual deletion/renaming recovery for valid cached IDs is deferred. Existing sessions are not migrated; resolution runs during a subsequent Google login.

## Configuration

All settings are server-only and listed in [the example](../.env.example):

| Variable | Purpose |
| --- | --- |
| `SERVICE_SHEET_ID` | Existing shared spreadsheet ID, not a worksheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email with edit access to that spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | PEM private key; actual newlines and escaped `\n` sequences are supported |
| `REDIS_URL` | Worksheet ID cache connection, shared with authentication |

Enable the Google Sheets API for the service account's project and share the configured spreadsheet with the service-account email as an editor. The service uses the spreadsheets OAuth scope through JWT service-account authentication, independently of the user's Google OAuth tokens. Google requests and token transport have ten-second timeouts with automatic retries disabled. No new package is required; google-auth-library is reused.

## Interfaces and source

| Source | Interface | Responsibility and authorization |
| --- | --- | --- |
| [spreadsheet/client.ts](../spreadsheet/client.ts) | `spreadsheetConfig()` | Validates required environment settings and normalizes key newlines |
| [spreadsheet/client.ts](../spreadsheet/client.ts) | `spreadsheetClient(config)` with `findWorksheet(sub) → number or null` and `createWorksheet(sub) → number` | Service-account-authenticated metadata lookup and atomic worksheet/schema creation; only trusted server callers may use it |
| [spreadsheet/schema.ts](../spreadsheet/schema.ts) | `WORKSHEET_SCHEMA`, `worksheetCreationRequests(sub, sheetId)` | Defines grid size, entity header columns, the balance formula, pivot anchor, and batch creation requests; accepts a trusted title and preallocated numeric sheet ID |
| [spreadsheet/worksheet.ts](../spreadsheet/worksheet.ts) | `ensureWorksheet(sub): Promise<number>` | Resolves/caches a worksheet ID; caller must first verify identity and whitelist membership; depends on the client and Redis |
| [OAuth callback](../app/auth/google/callback/route.ts) | GET handler | Supplies the verified sub and completes login only after resolution |

The spreadsheet folder is a service directory, not a page or API route. There are no spreadsheet server actions or UI components.

## Verification

Vitest covers cache hits, ID 0, existing/new worksheets, user/spreadsheet isolation, malformed cached IDs, missing configuration, Google failures, creation recovery, Redis failures, and escaped key newlines. Schema tests verify exact header ranges, balance formula placement, absence of the T1 pivot, pivot sources, grouping, aggregation, blank-row filtering, and consistent targeting within one batch. Authentication tests cover resolution ordering, denied identities, and session preservation on setup failure. Run tests, lint, TypeScript, and the production build. Live verification requires configured service-account credentials and access to the shared spreadsheet.
