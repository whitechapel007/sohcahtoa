This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security

### CSRF Mitigation

This app uses **cookie-based authentication** (HttpOnly JWT cookies) and relies on the `SameSite=Lax` attribute as its primary CSRF defence — no separate CSRF token is issued or validated.

**How `SameSite=Lax` prevents CSRF**

All auth cookies (`access_token`, `refresh_token`) are set with:

```ts
httpOnly: true,
secure: true,          // production only
sameSite: "lax",
```

`SameSite=Lax` instructs the browser to attach the cookie **only** on same-site requests or top-level navigations (e.g. clicking a link). It is **withheld** on cross-origin subresource requests — including `fetch`/`XMLHttpRequest` POST calls and form submissions from a third-party origin. This is exactly the class of request a CSRF attack relies on, so a forged cross-origin POST to `/api/dashboard/transactions/:id/flag` (or any other mutation endpoint) arrives with no cookies and is rejected with `401 Unauthorized`.

**Why no CSRF token is needed**

Explicit CSRF tokens (double-submit cookie, synchroniser token) exist to compensate for browsers that ignore `SameSite`. All major browsers have supported `SameSite=Lax` as the **default** since 2021 (Chrome 80+, Firefox 87+, Safari 16+). Layering a token on top would add complexity with no additional protection for this app's target environment.

**Scope and limitations**

- This mitigation covers all state-mutating endpoints (`POST`, `PATCH`, `DELETE`).
- The `/api/auth/login` endpoint is not protected by `SameSite` (it creates the session rather than consuming one), but it cannot be CSRF-exploited because there is no privileged session to hijack at login time.
- If this app ever needed to support `SameSite=None` cookies (e.g. for cross-origin embeds), a CSRF token layer would need to be added.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

demo credentials
'admin@sohcahtoa.com': 'admin123',
'analyst@sohcahtoa.com': 'analyst123',
