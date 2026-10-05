# Routes

This inventory describes implemented behavior. Authentication services and configuration are documented in [Authentication](authentication.md).

| Path | Type / method | Behavior | Source |
| --- | --- | --- | --- |
| `/` | Page | Session-protected logout form | [Home](../app/page.tsx) |
| `/login` | Page | Google sign-in and error messages | [Login](../app/login/page.tsx) |
| `/auth/google` | Handler / GET | Starts Google OpenID Connect | [Start](../app/auth/google/route.ts) |
| `/auth/google/callback` | Handler / GET | Verifies identity, resolves worksheet, and creates session | [Callback](../app/auth/google/callback/route.ts) |
| `/logout` | Handler / POST | Invalidates session | [Logout](../app/logout/route.ts) |

## Home

- **Component:** [Home](components.md#home), wrapped by RootLayout.
- **Authentication/input:** Reads the session cookie and Redis; no page props.
- **Output/errors:** Default Mantine logout button; absent/invalid/expired session redirects to `/login`. Redis errors render a short error message and Retry button without bypassing authentication.
- **Configuration:** `REDIS_URL`.

## Login

- **Component:** [Login](components.md#login), wrapped by RootLayout.
- **Authentication/input:** Public page; reads session cookie and optional `error` query parameter.
- **Output/errors:** Valid session redirects to `/`; otherwise a default Mantine sign-in button. Brief predefined messages for configuration, denied, failed, state, cancelled, unavailable, and worksheet errors. Unknown query values are ignored.
- **Configuration:** `REDIS_URL` for existing-session lookup.

## Google OAuth start

- **Authentication:** Public GET login initiation.
- **Inputs/configuration:** Google client ID, secret, callback URL, nonempty allowed-email list, and Redis URL; see [configuration](authentication.md#configuration).
- **Behavior/output:** Stores random state and nonce in Redis for ten minutes, sets browser-bound HttpOnly state cookie, redirects to Google with `openid email profile` scopes. No Sheets/Drive permissions or offline access.
- **Errors:** Configuration/storage failures redirect to login with a predefined error code; responses use no-store caching.

## Google OAuth callback

- **Authentication:** Public GET callback that authenticates through the handshake and verified Google ID token.
- **Inputs:** `state`, `code`, or provider `error`; browser state cookie, optional prior session cookie, authentication configuration, and [service-account spreadsheet configuration](spreadsheet.md#configuration).
- **Behavior/output:** Requires matching browser state; atomically consumes Redis handshake. Exchanges code, verifies ID token and nonce, requires verified approved email. Calls [ensureWorksheet](spreadsheet.md#interfaces-and-source) with verified Google sub: uses a Redis worksheet ID or finds/creates a worksheet. New worksheets are created atomically with entity headers, the account-balance formula, and the account/category pivot. Only after successful resolution invalidates an existing browser session and creates a random 30-day Redis session storing only Google sub. Sets session cookie, clears state cookie, redirects home. Tokens are never returned or persisted.
- **Errors:** Missing/mismatched/expired/replayed state, cancellation, missing code, exchange/verification failure, denied email, and storage/configuration failure redirect to login with predefined messages. Sheets setup errors use `error=worksheet`; Redis errors use `error=unavailable`. No session cookie is issued on failure. Worksheet failure preserves a prior session; a created worksheet may remain for recovery on the next login. All responses use no-store caching.

## Logout

- **Authentication/input:** POST with Origin matching the request URL origin, and optional session cookie.
- **Behavior/output:** Deletes Redis session and clears session/state cookies; 303 redirect to login. Missing/invalid session is harmless.
- **Errors:** Missing/cross-origin Origin returns 403 JSON. Redis deletion failure returns 503 HTML with a retry form and home link, preserving cookies. GET is unsupported.
- **Configuration:** `REDIS_URL`; production Secure cookies. Responses are not cached.
