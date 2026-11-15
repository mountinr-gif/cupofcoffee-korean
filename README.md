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

The newsletter forms are UI-only previews (`data-newsletter` in `assets/js/main.js`).
When a provider such as MailerLite or Kit is connected, replace the handler with the
provider's form action and remove the preview message.

## Audio

Pronunciation uses the browser's own speech engine (`window.speechSynthesis`,
`lang="ko-KR"`). Nothing is uploaded and no audio files are served.
