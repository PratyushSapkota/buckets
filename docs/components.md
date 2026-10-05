# Components

Application pages and layout are server components. Imported Mantine components supply the client-side provider and controls; there are no separate application client components.

| Component | Purpose | Source |
| --- | --- | --- |
| RootLayout | Document shell, Mantine provider, and metadata | [app/layout.tsx](../app/layout.tsx) |
| Home | Protected logout form | [app/page.tsx](../app/page.tsx) |
| Login | Google sign-in and error messages | [app/login/page.tsx](../app/login/page.tsx) |

## RootLayout

- **Role/input:** Server layout accepting children through `LayoutProps<"/">`.
- **Behavior:** English HTML, Buckets metadata, and default Mantine styles/provider. No custom fonts, theme, or layout styling.
- **Dependencies:** MantineProvider, ColorSchemeScript, mantineHtmlProps, and `@mantine/core/styles.css`.
- **Related:** Wraps Home and Login; authentication checks happen in the pages.

## Home

- **Role/input:** Server page at [`/`](routes.md#home); no page props.
- **Behavior:** Checks the Redis-backed session. Valid sessions render only a POST logout form with a default Mantine Button. Missing/expired sessions redirect to login. Storage failures show brief error Text and a Retry button that reloads home.
- **Dependencies:** Mantine Button/Text, `next/navigation`, [currentSession](authentication.md#services), RootLayout.
- **Limitations:** No finance data, worksheet initialization, or browser storage.

## Login

- **Role/input:** Server page at [`/login`](routes.md#login), accepting asynchronous search parameters with an optional `error`.
- **Behavior:** Valid sessions redirect home. Otherwise renders a default Mantine Continue with Google button linking to OAuth initiation. Only recognized error codes produce brief Text messages; query text is never echoed. No branding panel, explanatory copy, or custom styling.
- **Dependencies:** Mantine Button/Text, `next/navigation`, [currentSession](authentication.md#services), RootLayout.
- **Metadata:** Sign in | Buckets.
