# Compass Nexus iQ · Opus 5.5 Special Edition

**Intelligent Navigation** — the public website for Compass Nexus iQ
(Compass Travel & Transportation, Thiruvananthapuram).
Design from Compass Studio.

Static site: HTML, CSS and vanilla JavaScript with GSAP, Lenis and three.js
bundled locally in `assets/js/`. No build step, no backend, no API keys.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works. Opening `index.html` directly also works,
though some browsers restrict local files, so a server is recommended.

## Structure

```
index.html            page
assets/css/style.css  styles (dark / light themes)
assets/js/main.js     site behaviour
assets/js/*.min.js    vendored libraries (GSAP + plugins, Lenis, three.js, Motion)
assets/img/           photography, logo, icons, social card
robots.txt, sitemap.xml, site.webmanifest
```

## URL flags

- `?bg=light` / `?bg=dark` — force the background theme for a share link
- `?motion=1` — keep animations on even when the OS asks for reduced motion

## Version

`v1.0-opus` — snapshot of the Opus 5.5 Special Edition as published on
5 Oct 2026. Contains no Claude / Anthropic API integration.
