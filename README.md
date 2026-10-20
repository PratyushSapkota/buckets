# Buckets

Next.js App Router application with Google authentication through NextAuth v4.

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
7. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

Signed-out visitors to `/` are redirected to `/login`. Approved users return to `/` after Google login and can sign out there. Authentication uses cookie-based JWT sessions without a database and requests only Google's basic identity scopes.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

Set the same environment variables on your host, using your public HTTPS origin for `NEXTAUTH_URL` and a securely generated `NEXTAUTH_SECRET`. Register `https://your-domain/api/auth/callback/google` as an authorized redirect URI in Google Cloud. Keep the secret stable across deployments so existing sessions remain valid.

Reference: [NextAuth example](https://next-auth.js.org/getting-started/example), [App Router initialization](https://next-auth.js.org/configuration/initialization#route-handlers-app), and [Google provider setup](https://next-auth.js.org/providers/google).
