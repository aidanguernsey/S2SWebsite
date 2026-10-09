# [Group Name] website

The official site for [Group Name], [University]'s a cappella group: music and videos, upcoming concerts, merch, gig booking, group history, and a profile page for every current member and alum.

Built with **Next.js (App Router) + TypeScript**. Content lives in plain TypeScript files, so anyone on exec can update the site by editing one file.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/                     Pages (one folder per URL)
  page.tsx               Home
  music/                 /music — all releases
  events/                /events — upcoming + past shows
  members/               /members — current members by voice part
    exec/                /members/exec — exec board
    [slug]/              /members/jane-doe — individual profile pages
  alumni/                /alumni — alumni by class year
  about/                 /about — history timeline
  shop/                  /shop — merch
  book/                  /book — gig request form
  api/gig-request/       POST endpoint the booking form submits to
components/              Reusable UI pieces
content/                 ← Edit these to update the site
  site.ts                Group name, school, socials, history, booking info
  members.ts             Everyone, current and alumni
  events.ts              Concerts and shows
  releases.ts            Songs and videos
  merch.ts               Shop items
lib/types.ts             The shape of each content type
public/                  Images (member photos go in public/members/)
```

## Common updates

| Task | What to do |
| --- | --- |
| Add a member | Add an entry to `content/members.ts`. Put their photo at `public/members/<slug>.jpg` and set `photo: "/members/<slug>.jpg"`. Their profile page is created automatically. |
| Someone graduates | Change their `status` to `"alumni"` and remove `execRole`. They move to the alumni page. |
| New exec board | Update `execRole` on each person. |
| New concert | Add an entry to `content/events.ts`. It moves to "Past shows" automatically after the date. |
| New video | Add an entry to `content/releases.ts` with the YouTube video ID (the part after `watch?v=`). |
| New merch | Add an entry to `content/merch.ts` with a `buyUrl`. |

Please get each person's OK on their bio and photo before publishing, and let alumni opt out.

> Note: `exec` is a reserved URL under `/members`, so don't give a member the slug `exec`.

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

There's deliberately no custom payment code. Each item's `buyUrl` points to a hosted checkout:

- **Stripe Payment Links:** create a product in Stripe and paste its payment link.
- **Printful / Fourthwall / Shopify:** print-on-demand, so the group never holds inventory.

Check with your student activities office about how student organizations may collect money before going live.

## Deploying

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com (free hobby plan).
3. Add the environment variables above.
4. Every push to `main` redeploys the site automatically.

## Roadmap ideas

- Move `content/` into a headless CMS (Sanity or Contentful) so exec can edit in a visual editor without touching code.
- Admin page for gig requests with statuses (new / contacted / booked / declined), backed by a database such as Supabase.
- Event RSVP or QR-code attendance check-in.
- Spotify embed player on the Music page.
- Image optimization with `next/image` once real photos are added.
