# Cup of Coffee Korean

The free static site for **@cupofcoffee_korean** — *Daily KR sentence for you*.
Pure HTML, CSS and JavaScript. No build step, no framework, no server cost.

## Deploy

**GitHub Pages (project site)**

1. Push this folder to `main`.
2. Repository → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/cupofcoffee-korean/`.

**Cloudflare Pages**

1. Pages → Create a project → connect this repository.
2. Framework preset: *None*. Build command: *(empty)*. Build output directory: `/`.
3. Deploy. Every push to `main` redeploys.

## Structure

```
index.html                     home
posts/gyeongbokgung-palace-korean.html
posts/korean-pocha-drinking-culture.html
posts/gs25-convenience-store-combos.html
about.html  privacy.html  terms.html
sitemap.xml  robots.txt
assets/css/style.css
assets/js/main.js
assets/images/*.jpg            1200px-wide JPEGs, ~170 KB each
assets/downloads/cupofcoffee-gs25-phrase-card.pdf   free 1-page phrase card
assets/audio/*.mp3            94 Korean recordings (sentences + vocabulary)
```

All internal links are **relative** (`assets/...`, `../assets/...`), so the site works
from a subpath such as `/cupofcoffee-korean/` as well as from a domain root.

## Before switching to a custom domain

The absolute URLs (canonical tags, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`)
currently point at `https://mountinr-gif.github.io/cupofcoffee-korean/`.
When a custom domain is connected, update those in all files — a find-and-replace of
that base URL is enough.

## Advertising

No ad scripts are loaded yet. The insertion points are marked with HTML comments
(`AD SLOT ...`) in the three lessons, and the head of every page has a comment where
the AdSense verification tag and the auto-ads script go after approval.

## Forms

The newsletter forms are live. `assets/js/main.js` posts

```
POST https://app.kit.com/forms/9209507/subscriptions
Content-Type: application/json
{ "email_address": "…", "first_name": "…" }   // first_name is omitted when empty
```

and shows three states: sending, signed up (with the Gumroad free-trial link), and a
failure message that offers the landing page and Instagram as a fallback. The Kit form
ID and the Gumroad / landing URLs live in two places that must stay in sync:
`site_build/lib.py` (constants at the top) and the top of `assets/js/main.js`.

## Paid subscription

- Gumroad: https://coffeekorean.gumroad.com/l/newsletter ($6.99/mo, $59/yr, 7-day free trial)
- Landing page: https://cup-of-coffee-korean.netlify.app

Both are linked with `target="_blank" rel="noopener"` from the home page, every lesson
sidebar and lesson footer, and every paid mention is labelled as paid. No payment is
taken on this site.

## Downloads

`assets/downloads/cupofcoffee-gs25-phrase-card.pdf` is the free one-page GS25 phrase card
(12 sentences). The 4-page Seoul Survival Pack (39 sentences) is not hosted here; it is
offered through the Kit list and Instagram DM.

## Audio

Every speaker button carries `data-audio="../assets/audio/<lesson>-NN.mp3"` and plays a
real MP3 (94 files: 40 lesson sentences incl. the 14 pocha cards, 54 vocabulary words,
`ko-KR-InJoonNeural`). `assets/js/main.js` uses an HTML5 `Audio` object with
`playbackRate` 1.0x / 0.8x and `preservesPitch`, so the sound also works on iOS with the
silent switch on and inside in-app browsers. `window.speechSynthesis` remains only as a
fallback when a file is missing or cannot be played.
