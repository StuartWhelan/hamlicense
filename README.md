# Ham Study — NZART General Amateur Operator's Certificate

An installable **Progressive Web App** for studying the New Zealand amateur radio
("Ham") licence exam. Works fully offline once installed on an Android (or any) device.

## Features

- **Mock Exam** — 60-question papers generated exactly like the real exam: one question
  drawn from each block of ten within every topic, so topics appear in true proportion.
  2-hour timer, scored against the official **40/60 pass mark**, with a per-topic
  breakdown and review of every missed question.
- **Study by Topic** — drill any of the 30 topics with immediate feedback, correct-answer
  highlighting, and circuit/device diagrams.
- **Spaced Repetition** — an SM-2 scheduler resurfaces questions right before you'd forget
  them. Questions you miss anywhere are enrolled automatically.
- **Progress** — per-topic mastery bars, a predicted exam score / readiness estimate, and
  exam history. All stored on-device (localStorage); nothing leaves your phone.

## Data provenance

The 600-question bank (30 topics) is NZART's public-domain amateur examination pool. The
parsed JSON + diagram PNGs are seeded from Richard Walmsley's (ZL1RSW) public-domain
[`nzarttrainer`](https://github.com/richwalm/nzarttrainer) and **validated against the
official NZART Question Bank (Jan 2026)** — 599/600 match verbatim, the remaining one is
present with light rewording. Pass mark (40/60) and 2-hour limit are from NZART's 2025
Examination Procedure.

This is an unofficial study aid. Question bank © NZART.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/ (includes service worker)
npm run preview    # serve the production build
```

## Install on your Android phone

A PWA installs from a URL served over **HTTPS** (or localhost). Options:

1. **Quick / free hosting** — deploy `dist/` to any static host (GitHub Pages, Netlify,
   Cloudflare Pages, Vercel). Open the URL in Chrome on your phone → menu → *Install app* /
   *Add to Home screen*. It then runs offline.
2. **Same-Wi-Fi test** — `npm run preview` prints a `Network:` URL. Chrome may restrict
   install to HTTPS, but you can still use it in the browser over your LAN.

Once installed the app caches all questions and diagrams, so it works with no signal.

## Regenerating icons

```bash
python3 scripts/gen-icons.py
```
