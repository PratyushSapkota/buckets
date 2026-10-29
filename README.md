# Buckets

Personal beta ledger built with Next.js, Google authentication through NextAuth v4, and a private Google spreadsheet.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`, or update your existing `.env.local`.
3. Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` using a Google Cloud OAuth client of type **Web application**.
4. Set `GOOGLE_OAUTH_ALLOWED_EMAILS` to comma-separated approved email addresses, for example `you@example.com,teammate@example.com`. Matching ignores case and surrounding spaces. Google must verify the email address; an empty list denies all sign-ins.
5. Set `NEXTAUTH_URL=http://localhost:3000` and generate a private `NEXTAUTH_SECRET`:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

6. Add `http://localhost:3000/api/auth/callback/google` to the OAuth client's **Authorized redirect URIs** in Google Cloud. The previous `/auth/google/callback` route and `GOOGLE_OAUTH_CALLBACK_URL` setting are no longer used.
7. Enable the Google Sheets API for the service account's Google Cloud project. Set `SERVICE_SHEET_ID` to the spreadsheet ID, `GOOGLE_SERVICE_ACCOUNT_EMAIL` to the service account email, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` to its PEM RSA private key. Quoted literal `\n` escapes and multiline keys are accepted and normalized.
8. Share the private spreadsheet with the service account as an **Editor**. Create a worksheet whose title exactly matches each approved user's Google email address. Preserve the existing template: transaction columns A:G, account columns I:M, and pivot columns O:Q, with headers in row 1. Users' ledger data belongs in their separate worksheets.
9. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000). Required configuration is validated at server startup; errors identify the setting without printing its value. An empty allowlist intentionally denies access.

Signed-out visitors to `/` are redirected to `/login`. Approved users return to `/` after Google login and can sign out there. Authentication uses cookie-based JWT sessions without a database and requests only Google's basic identity scopes. The allowlist is also checked before ledger access.

## Beta behavior and limits

- Only account and transaction creation is supported. Archive, update, delete, and unknown actions are rejected as a whole batch; edit/delete menu items are disabled.
- Server validation limits a sync to 100 changes, names/buckets/categories to 100 characters, and descriptions to 1,000 characters. Amounts must be nonzero safe integers in minor units; transfers require positive amounts and distinct active accounts.
- Sync checks existing IDs, acknowledges identical retries, and rejects conflicting IDs or broken transfer pairs before writing. Account and transaction insertions and values are committed in one atomic Sheets batch. The application does not automatically retry writes.
- A loader-only screen replaces the app during sync. Failed syncs retain the pending queue. Successful syncs remove only submitted queue records and refresh the ledger.
- Pending changes are stored in browser IndexedDB. Starting login or logout discards them. Cleanup failure blocks the authentication transition. Ordinary page loads do not clear the queue.
- Concurrent syncs to the **same worksheet** from multiple tabs, devices, or serverless instances are unsupported. No distributed lock is used: simultaneous requests can both pass the ID check before either commits. Different users have separate worksheets.
- Request rate limiting is intentionally excluded from this personal beta. There is no Redis dependency or shared counter. Google API quotas still apply; repeated usage can temporarily disrupt ledger access for both users.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Run all four checks before release. Automated tests use fixtures and mocked Google calls; they do not use live financial data. Keep the real `.env.local`, OAuth secret, service-account private key, and session secret out of Git and client-side bundles.

Set all settings from `.env.example` in the serverless host's server-side environment. Use your public HTTPS origin for `NEXTAUTH_URL` and a securely generated `NEXTAUTH_SECRET` of at least 32 characters. Register `https://your-domain/api/auth/callback/google` as an authorized redirect URI in Google Cloud. Keep the session secret stable across deployments. Public production HTTP origins are rejected; loopback HTTP is permitted for local production smoke checks.

Keep the spreadsheet's general access **Restricted**. Share only with its owner, necessary trusted operators, and the service account. Give the service account access only to required spreadsheets, keep its key in the host's secret settings, and never prefix these settings with `NEXT_PUBLIC_`. The server-side Sheets scope does not grant end users direct Google Sheets authorization.

The app enforces framing prevention, MIME sniffing protection, a no-referrer policy, and baseline CSP restrictions. A broader CSP is **report-only** during beta; inspect browser violations before moving it to enforcement. Next.js and Mantine inline scripts need nonce support first; Mantine inline styles and Google avatar images must remain supported. There is no remote CSP-report collector. HSTS is emitted only with production mode and an HTTPS `NEXTAUTH_URL`.

After deployment, verify the actual HTTPS response headers, sign-in callback, private sheet sharing, and a sync using a dedicated test worksheet. Hosting settings can alter headers; local tests cannot confirm those settings. Publishing and live-data testing are separate actions.

Reference: [NextAuth example](https://next-auth.js.org/getting-started/example), [App Router initialization](https://next-auth.js.org/configuration/initialization#route-handlers-app), and [Google provider setup](https://next-auth.js.org/providers/google).
