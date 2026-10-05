# Routes

This inventory describes implemented routes. Intended routes and flows are in [design.md](design.md#8-allowed-routes-and-home-components).

| Path | Type / method | Implemented behavior | Source |
| --- | --- | --- | --- |
| `/` | Page | Next.js starter page; not yet session-protected | [app/page.tsx](../app/page.tsx) |
| `/auth/google` | Handler / GET | Starts Google OAuth; target path is `/google/auth` | [OAuth start](../app/auth/google/route.ts) |
| `/auth/google/callback` | Handler / GET | Exchanges authorization code and returns token information; target path is `/google/auth/callback` | [OAuth callback](../app/auth/google/callback/route.ts) |

## Home

- **Path/type:** `/`, page.
- **Source/component:** [app/page.tsx](../app/page.tsx), [`Home`](components.md#home), wrapped by [`RootLayout`](components.md#rootlayout).
- **Authentication:** None implemented.
- **Inputs:** No page props or query processing.
- **Output:** Static Next.js starter page with external resource links.
- **Configuration:** No environment variables used by the page.

## Google OAuth start

- **Path/method:** `/auth/google`, GET handler.
- **Source:** [app/auth/google/route.ts](../app/auth/google/route.ts).
- **Purpose:** Redirects to Google's OAuth authorization endpoint.
- **Authentication:** Public login initiation; no existing-session check.
- **Inputs:** `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CALLBACK_URL` from server environment.
- **Output:** Redirect requesting an authorization code, `access_type=offline`, and scopes `openid`, `email`, `profile`, Sheets, and `drive.file`.
- **Behavior limits:** No state parameter, whitelist check, or session creation is implemented in this handler.

## Google OAuth callback

- **Path/method:** `/auth/google/callback`, GET handler.
- **Source:** [app/auth/google/callback/route.ts](../app/auth/google/callback/route.ts).
- **Purpose:** Exchanges the authorization code for Google tokens using Axios.
- **Authentication:** No application session or identity verification is implemented.
- **Inputs:** `code` query parameter; `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_CALLBACK_URL`.
- **Output:** JSON containing `hasAccessToken`, `hasRefreshToken`, and `rawToken`. No home redirect.
- **Errors:** Missing code returns HTTP 400 with `Missing auth code`. Token-exchange errors have no explicit local handling.
- **Behavior limits:** No callback state validation, ID-token verification, whitelist validation, Redis session, or worksheet initialization is implemented.

No application server actions or standalone services are currently implemented. Their intended interfaces are in [design.md](design.md#9-server-interface-and-configuration).
