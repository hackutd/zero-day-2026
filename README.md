# Harp Marketing Site

The public marketing site for a hackathon running on [Harp]. Next.js App Router,
deployed to Vercel as its own project, independent of the Harp portal and Go
backend.

This lives in its own repository on purpose. The marketing site is redesigned for
every iteration of a hackathon, while the platform behind it stays put — keeping
it out of the Harp repo means a yearly redesign never touches the portal, and a
school adopting Harp can restyle its public site without diverging from upstream.

This is intentionally a scaffold: `app/page.tsx` exists to prove the backend
connection works and to show what the public API returns. Replace it with the
year's themed design. What you keep is the data layer in `lib/`.

[Harp]: https://github.com/hackutd/harp

## Local setup

The Go backend must be running. From your **Harp checkout** (a separate
repository):

```bash
docker-compose up -d   # PostgreSQL
air                    # Go API on :8080
```

Then in this repository:

```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3001
```

Port 3001, not 3000 — the portal owns 3000 (it's pinned there by `FRONTEND_URL`
and the SuperTokens `WebsiteDomain`).

Open the page. If the env vars aren't set it renders setup instructions; once
they are, it renders live schedule, sponsor, and FAQ data.

## Environment

| Variable              | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `HARP_API_BASE_URL`   | Go service base URL, no trailing slash        |
| `HARP_PUBLIC_API_KEY` | Must match `PUBLIC_API_KEY` on the Go service |

Neither is prefixed `NEXT_PUBLIC_`, and that is deliberate.

## Why the API calls are server-only

`/v1/public/*` is public in the sense that it needs no user session, but it is
**not** unauthenticated. It sits behind `APIKeyMiddleware` (`cmd/api/api.go` in
the Harp repo), which compares an `X-API-Key` header against the backend's
`PUBLIC_API_KEY`. That's a shared secret.

So `lib/api.ts` starts with `import "server-only"`. Fetch from Server
Components; importing it into a Client Component fails the build with an import
trace rather than silently shipping the key to browsers. If you need the data in
an interactive component, fetch it in a Server Component and pass it down as
props.

This is also why the site can't be a static export — that would move the fetch
into the browser and expose the key.

## Available endpoints

| Endpoint                  | Function        | Returns          |
| ------------------------- | --------------- | ---------------- |
| `GET /v1/public/schedule` | `getSchedule()` | `ScheduleItem[]` |
| `GET /v1/public/sponsors` | `getSponsors()` | `Sponsor[]`      |
| `GET /v1/public/faq`      | `getFAQs()`     | `FAQ[]`          |

### Sponsor logos

`logo_data` is **raw base64**, not a URL. Pair it with `logo_content_type` to
build a data URI; `sponsorLogoSrc()` in `lib/format.ts` does this, rejecting any
non-`image/*` content type and falling back to a monogram when a sponsor has no
logo.

Because logos are inlined rather than linked, this response grows with every
sponsor — a dozen 50KB logos is a ~600KB payload per revalidation. Fine at the
5-minute ISR cadence, but worth moving to GCS URLs if logos get large.

Responses are wrapped in Harp's envelope (`{"data": ...}`); `lib/api.ts`
unwraps it. Types in `lib/types.ts` mirror the Go structs in the Harp repo's
`internal/store/`. That coupling now spans two repositories, so nothing will
catch a drift for you: when a public endpoint's shape changes upstream, update
`lib/types.ts` in the same sitting.

Fetches use `revalidate: 300`, so pages rebuild at most every 5 minutes. Each
call is tagged (`public:schedule`, etc.) if you later want on-demand
revalidation from a webhook.

## Deploying

Vercel project with **Root Directory** left at the repository root (`.`). This
repo is the whole project, so the "Include source files outside of the Root
Directory" setting no longer applies — that was only needed while the site lived
inside the Harp monorepo. `vercel.json` already pins the framework preset to
`nextjs`.

Set both env vars for Production _and_ Preview — preview deploys fetch at build
time too.

Run `npm run format:check`, `npm run lint`, and `npm run typecheck` in CI, but
**not** `next build`. Vercel owns the build because it holds the API key; a CI
build without the key would either fail or silently render the setup page.
