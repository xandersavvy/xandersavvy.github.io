# Portfolio Test Suite

End-to-end tests for [xandersavvy.github.io](https://xandersavvy.github.io) using [Playwright](https://playwright.dev).

## Structure

```
tests/
├── package.json          # dependencies & run scripts
├── playwright.config.js  # config — baseURL, browsers, timeouts
└── specs/
    ├── nav.spec.js        # Navigation links, hamburger drawer, scroll
    ├── hero.spec.js       # Hero content, terminal game commands
    ├── theme.spec.js      # Dark/light toggle, localStorage, palette colours
    ├── sections.spec.js   # About, Skills, Experience, Projects, Certs, Credly badges
    ├── bg.spec.js         # SVG background — shapes, theme-aware ink, star/bird swap
    ├── cv.spec.js         # cv.html — toolbar, markdown render, palette tokens
    ├── contact.spec.js    # Contact links, dad-jokes section
    └── a11y.spec.js       # ARIA roles, alt text, keyboard nav, SEO meta
```

## Prerequisites

1. **Node.js** ≥ 18
2. **Live server** running at `http://127.0.0.1:5500` (e.g. VS Code Live Server extension)

## Setup

```bash
cd tests
npm install
npx playwright install --with-deps
```

## Run

```bash
# All tests, all browsers (headless)
npm test

# Headed (watch the browser)
npm run test:headed

# Interactive UI mode
npm run test:ui

# Show last HTML report
npm run test:report
```

## Browsers

| Project       | Device            |
|---------------|-------------------|
| `chromium`    | Desktop Chrome    |
| `firefox`     | Desktop Firefox   |
| `mobile-chrome` | Pixel 5 (390×844) |

## Coverage

| Spec            | What is tested |
|-----------------|----------------|
| `nav.spec.js`   | All nav links present, hamburger open/close, drawer link closes drawer |
| `hero.spec.js`  | Name/role copy, CTA links, social links, terminal `help/whoami/skills/unknown` |
| `theme.spec.js` | Toggle switches attribute, persists via localStorage, correct rustic hex colours, bg-canvas redraws |
| `sections.spec.js` | About stats, skill tags, IBM experience, project card flip/unflip, certs, 10+ Credly badge images load |
| `bg.spec.js`    | Shape count > 0, light ink `#5a3e2b`, dark ink `#d4b896`, birds in light / stars in dark, viewBox on resize |
| `cv.spec.js`    | Toolbar, Back link, PDF button, markdown loads, rustic palette in both themes |
| `contact.spec.js` | Email/GitHub/LinkedIn/Credly links, joke API mock, Next joke button |
| `a11y.spec.js`  | `<main>` present, nav ARIA, button labels, img alt text, meta description, canonical, keyboard Tab/Enter |
