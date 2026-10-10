# S2S website

The official site for Soul2Soul, Miami University's premier tenor-bass a cappella group: music and videos, upcoming concerts, merch, gig booking, group history, and a profile page for every current member and alum.

Built with **Next.js (App Router) + TypeScript**. Content (members, events, releases, merch, group info) is edited in **[Sanity](https://www.sanity.io) Studio** at `/studio` on the site itself, so exec can update the site from a browser without touching code.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Until Sanity is set up (below), the site shows the starter data in `content/`.

## Project structure

```
app/
  (site)/                Public pages (one folder per URL; "(site)" isn't part of the URL)
    layout.tsx           Header + footer
    page.tsx             Home
    music/               /music — albums, EPs, and singles, each with its tracks, then videos not yet on streaming
    events/              /events — upcoming + past shows
    members/             /members — current members by voice part
      exec/              /members/exec — exec board
      [slug]/            /members/jane-doe — individual profile pages
    alumni/              /alumni — alumni by class year
    about/               /about — history timeline
    shop/                /shop — merch
    book/                /book — gig request form
  studio/                /studio — Sanity Studio, the content editor
  api/gig-request/       POST endpoint the booking form submits to
  api/revalidate/        Sanity webhook: refreshes the site on publish
components/              Reusable UI pieces
lib/content.ts           Fetches content from Sanity (or content/ as a fallback)
lib/types.ts             The shape of each content type
sanity/schemaTypes/      The fields exec sees in the Studio
sanity.config.ts         Studio setup (sidebar, singleton site settings)
content/                 Starter data: copied into Sanity by `npm run seed`
public/                  Static images
```

## Editing content

Everything is edited at **`/studio`** (e.g. `https://yoursite.com/studio`). Sign in, open a document, edit, and click **Publish**. Changes show up on the site within seconds if the webhook below is set up, or within a minute without it.

| Task | What to do in the Studio |
| --- | --- |
| Add a member | **Current members → +**. Fill in the fields, click **Generate** next to Profile URL, upload a photo. Their profile page is created automatically. |
| Someone graduates | Open them, set **Status** to Alumni and clear **Exec role**. They move to the alumni page. |
| New exec board | Update **Exec role** on each person. President, Music Director, and Business Manager are listed first; edit `execRoleOrder` in `lib/content.ts` to change that. |
| New concert | **Events → +**. Times are in Eastern time. It moves to "Past shows" automatically after the date. |
| New album, EP, or single | **Music & videos → +**. Pick the **Type**, paste the Spotify link to the whole release, then add each song under **Tracks** in track-list order. Give each track its YouTube link and/or Spotify track link: with no YouTube link, it shows a Spotify player. The Music page groups releases into Albums, EPs, and Singles, and the homepage shows the newest tracks. Turn on **Pin to homepage** to feature an older release. |
| New video for an existing song | Open the release, open the track under **Tracks**, and paste its YouTube link. |
| Video of a song that isn't released yet | **Not yet on streaming → +**. Paste the YouTube link and the date it was posted. It's listed at the bottom of the Music page, newest first. Once the song comes out, add it to its release and delete it here. |
| New merch | **Merch → +** with a **Buy link**. |
| Group info, socials, booking, history | **Site settings**. |

Please get each person's OK on their bio and photo before publishing, and let alumni opt out.

> Note: `exec` is a reserved URL under `/members`, so the Studio won't let you give a member that Profile URL.

### Setting up Sanity (once)

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage), ideally under the group's shared account so it survives officer handoffs. Use the default `production` dataset, and keep it public: the site reads it without a key, and it only holds what the site already shows.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SANITY_PROJECT_ID` to the project ID.
3. In the project's **API → CORS origins**, add `http://localhost:3000` and your live URL (e.g. `https://yoursite.com`), both with **Allow credentials** checked. The Studio can't sign in without this.
4. Copy the current content over: in **API → Tokens**, create a token with **Editor** permissions, put it in `.env.local` as `SANITY_API_WRITE_TOKEN`, and run `npm run seed` (Node 22.18 or newer). This uploads the photos from `public/` as well. Afterwards you can delete the token. Use `npm run seed -- --dry-run` to preview first.
5. On Vercel, add `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_REVALIDATE_SECRET` (any long random string) under Project → Settings → Environment Variables, then redeploy.
6. For instant updates, go to **API → Webhooks → Create webhook**: URL `https://yoursite.com/api/revalidate`, dataset `production`, trigger on Create/Update/Delete, HTTP method POST, and **Secret** set to the same value as `SANITY_REVALIDATE_SECRET`.
7. Invite exec under **Members → Invite** with the Editor role. When officers change, remove the old ones there.

Once Sanity is live, `content/` is not read by the site; editing it has no effect.

## Gig requests

The form on `/book` posts to `app/api/gig-request/route.ts`, which validates the input, drops obvious spam (hidden "honeypot" field), and emails the request to the business manager via [Resend](https://resend.com).

To turn on email, copy `.env.example` to `.env.local` and fill in:

```
RESEND_API_KEY=...
GIG_REQUEST_TO=business-manager@example.edu
GIG_REQUEST_FROM=Gig Requests <gigs@yourgroup.com>   # optional, needs a verified domain
```

Without the first two, requests are printed to the server console, which is fine for development. Until you verify a domain in Resend and set `GIG_REQUEST_FROM`, Resend's test sender can only deliver to the email you signed up to Resend with, so set `GIG_REQUEST_TO` to that address. On Vercel, add the same variables under Project → Settings → Environment Variables.

### Gig request spreadsheet

Every request can also be added as a row in a Google Sheet, via a small Apps Script in [`scripts/gig-sheet.gs`](scripts/gig-sheet.gs):

1. Create a Google Sheet (ideally in the group's shared Google account so it survives officer handoffs).
2. In the Sheet, open **Extensions → Apps Script**, replace everything in `Code.gs` with the contents of `scripts/gig-sheet.gs`, and save.
3. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* to **Me** and *Who has access* to **Anyone**, then **Deploy** and approve the permissions prompt.
4. Copy the Web app URL (ends in `/exec`) and set it as `GIG_SHEET_URL` in `.env.local` and on Vercel, then redeploy.

The header row is added automatically on the first request. Email and the sheet are independent: the visitor only sees an error if every configured destination fails. Keep the `/exec` URL private, since anyone who has it can add rows. If you edit the script later, use **Deploy → Manage deployments → Edit → Version: New version** so the same URL picks up the change.

## Merch checkout

There's deliberately no custom payment code. Each merch item's **Buy link** points to a hosted checkout:

- **Stripe Payment Links:** create a product in Stripe and paste its payment link.
- **Printful / Fourthwall / Shopify:** print-on-demand, so the group never holds inventory.

Check with your student activities office about how student organizations may collect money before going live.

## Deploying

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com (free hobby plan).
3. Add the environment variables above.
4. Every push to `main` redeploys the site automatically.

## Roadmap ideas

- Admin page for gig requests with statuses (new / contacted / booked / declined), backed by a database such as Supabase.
- Event RSVP or QR-code attendance check-in.
- Image optimization with `next/image` once real photos are added.
