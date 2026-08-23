# HackUTD Marketing Site

The current year's public marketing site. Next.js App Router, deployed to
Vercel as its own project, independent of the HARP portal and Go backend.

This is intentionally a scaffold: `app/page.tsx` exists to prove the backend
connection works and to show what the public API returns. Replace it with the
year's themed design. What you keep is the data layer in `lib/`.

## Local setup

The Go backend must be running. From the repo root:

```bash
docker-compose up -d   # PostgreSQL
air                    # Go API on :8080
```

Then in this directory:

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
**not** unauthenticated. It sits behind `APIKeyMiddleware` (`cmd/api/api.go`),
which compares an `X-API-Key` header against the backend's `PUBLIC_API_KEY`.
That's a shared secret.

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

Responses are wrapped in HARP's envelope (`{"data": ...}`); `lib/api.ts`
unwraps it. Types in `lib/types.ts` mirror the Go structs in `internal/store/` —
change them together.

Fetches use `revalidate: 300`, so pages rebuild at most every 5 minutes. Each
call is tagged (`public:schedule`, etc.) if you later want on-demand
revalidation from a webhook.

## Deploying

Vercel project with **Root Directory** set to `client/marketing`, and "Include
source files outside of the Root Directory" off so portal-only pushes don't
trigger rebuilds. Set both env vars for Production _and_ Preview — preview
deploys fetch at build time too.

CI (`.github/workflows/audit.yaml`, job `marketing-audit`) runs format, lint,
typecheck, and audit — but not `next build`. Vercel owns the build because it
holds the API key.
