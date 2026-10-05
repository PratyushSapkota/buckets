# Authentication

## Behavior

Google identity is verified server-side using google-auth-library. OAuth uses the existing `/auth/google` and `/auth/google/callback` routes. State is browser-bound through an HttpOnly cookie and consumed once with Redis GETDEL; the ID token nonce must match the stored handshake. The library verifies signature, issuer, audience, and expiry. The app requires a nonempty subject, verified email, and whitelist membership.

Redis stores `oauth:<state> → nonce` for ten minutes and `session:<random-id> → Google sub` for exactly 30 days. IDs use 32 cryptographically random bytes encoded as hex. Session reads do not renew expiry. Whitelist changes apply at the next login; revoke an existing session by deleting its Redis key.

Cookies are HttpOnly, SameSite=Lax, Path=/, Secure in production, and expire with their corresponding Redis records. Google tokens are discarded after verification. A successful login invalidates a prior session from the browser before establishing a new one.

After identity and whitelist verification, the callback resolves the user's worksheet through [spreadsheet services](spreadsheet.md) before invalidating an old session or creating a new one. Newly created worksheets include entity headers, the account-balance formula, and the account/category pivot. Sheets or worksheet-cache failures prevent login completion. Worksheet mappings are independent of sessions and survive logout.

Home and login validate sessions in server components. Storage failures do not bypass authentication. Logout is a same-origin POST; deletion failure retains cookies and offers retry. No middleware, entity writes, IndexedDB, or client-side cleanup exists in this step. Existing sessions are not retroactively provisioned; worksheet resolution runs on the next successful Google login.

## Configuration

Server-only environment variables:

| Name | Purpose |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client and expected ID-token audience |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Authorization-code exchange credential |
| `GOOGLE_OAUTH_CALLBACK_URL` | Absolute URL ending exactly in /auth/google/callback; must match Google Console registration |
| `GOOGLE_OAUTH_ALLOWED_EMAILS` | Comma-separated approved verified emails; whitespace trimmed and comparison lowercased; empty denies login |
| `REDIS_URL` | Existing Redis connection using redis:// or rediss:// |

Login completion also requires `SERVICE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`; see [spreadsheet configuration](spreadsheet.md#configuration).

Copy [the example](../.env.example) into local server configuration and provide your own values. Production callback URLs require HTTPS; development HTTP callbacks are accepted only on loopback hosts. Redis must support GETDEL (Redis 6.2+). No Redis server is provisioned by the app. Behind a reverse proxy, preserve the public request origin so logout Origin validation succeeds.

## Services

| Source | Interface and responsibility |
| --- | --- |
| [redis/client.ts](../redis/client.ts) | `withRedis(operation)` reuses a process-wide client/connection promise, disables offline queues and automatic reconnect, bounds operations to five seconds, destroys stalled connections, and converts failures to RedisUnavailableError without exposing connection details |
| [redis/sessions.ts](../redis/sessions.ts) | `createSession(sub) → id`, `readSession(id?) → sub or null`, `deleteSession(id?)`; only server callers may use these; route/page callers enforce authorization |
| [redis/sessions.ts](../redis/sessions.ts) | `createHandshake() → {state, nonce}`, `consumeHandshake(state) → nonce or null`; atomically deletes the public handshake after browser binding is checked by callback |
| [auth/service.ts](../auth/service.ts) | `authConfig()` validates server settings, `verifyIdentity(code, nonce) → sub` verifies Google identity and whitelist, `currentSession() → sub or null` reads cookie and Redis |
| [auth/responses.ts](../auth/responses.ts) | `loginError(request, error)` maps safe error codes to login redirects, clears state cookie, prevents caching |

These modules are server-only; there are no server actions. Their inputs must never be treated as authorization without the identity/session checks described above.

## Errors and verification

Login supports fixed messages for configuration, denied, failed, state, cancelled, unavailable, and worksheet codes. Worksheet setup failures use a concise retry message; Redis failures use the existing unavailable message. Upstream errors, secrets, tokens, and arbitrary query strings are not rendered.

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Vitest mocks Google and Redis boundaries to test handshake replay/expiry, identity rejection, whitelist checks, cookies, session lifetime, page redirects, outage behavior, and logout. Live verification additionally requires configured Google credentials, registered callback, an approved Google account, and reachable Redis; complete Google consent in a browser, refresh home, and sign out.
