# Portfolio

My personal portfolio, built with Angular 21 and three.js.
The hero has a 3D version of me that follows your cursor, waves when you tap it and can be turned around by dragging.
The rest of the page sits on a 3D particle field that moves as you scroll.

## Run it locally

```bash
npm install
npm start
```

Then open http://localhost:4200.

## Where things live

| What                                   | File                                 |
| -------------------------------------- | ------------------------------------ |
| All text, links, projects, avatar look | `src/app/data/portfolio.data.ts`     |
| Types for that data                    | `src/app/models/portfolio.model.ts`  |
| Colors, fonts, spacing                 | `src/styles/_theme.scss`             |
| Breakpoints                            | `src/styles/_mixins.scss`            |
| Animation timings, effect strengths    | `src/app/config/ui.config.ts`        |
| 3D camera, lights, particles, shapes   | `src/app/config/scene.config.ts`     |
| Icons                                  | `public/icons.svg`                   |

To change anything you see on the page, start with `portfolio.data.ts`. The section numbers in the headings come from
the `nav` list, so reordering it renumbers the page.

```
src/app
├── config/       tunable numbers
├── data/         site content
├── models/       TypeScript interfaces
├── layout/       navbar, footer
├── sections/     one folder per page section
├── shared/       icon, section heading, reveal and tilt directives, helpers
└── three/        3D scenes (avatar, background) and their helpers
```

three.js is loaded with `@defer`, so the first paint only ships about 60 kB of JavaScript (gzipped).
All sizes are in `rem` and the root font size grows with the screen, so the layout scales up on large monitors.

## Photo and avatar

The hero avatar is picked from the `avatar` block in `portfolio.data.ts`, first match wins:

1. **`modelUrl`**: a `.glb` file in `public/models/`. It is scaled to fit, plays its first animation,
   waves if it has a clip called "wave" or "hello", and turns its head bone towards the cursor.
2. **`photoUrl`**: a cut-out photo (transparent PNG or WebP) in `public/images/`. In the browser it is shaped into
   a 3D relief: the silhouette is inflated so the body comes forward, and it leans towards the cursor.
3. **Neither** (what the site uses now): a built-in 3D character of me, made from simple shapes and dressed from
   the colours in the same block: skin, hair, checked blazer, black shirt, watch, light moustache. It breathes,
   blinks, follows the cursor, looks around on its own when the cursor is still, and waves when tapped.
   The haircut is set in `HAIRSTYLE` and the arm poses in `ARM`, both at the top of `three/avatar/avatar-figure.ts`.

The About section shows `profile.photo` in a tilting frame, with the head popping out over the top.

## Scroll animations

Every block marked with `appReveal` is tied to the scroll position, not to a one-off trigger: it fades,
lifts and tilts in as it comes up from the bottom of the screen, fades out again near the top, and runs
backwards when you scroll up. The distances live in `_theme.scss` (`--reveal-*`), the timing in
`ui.config.ts` (`reveal`).

## Deploy to GitHub Pages

1. Create a repository named `<username>.github.io` (or any other name, the workflow handles the base path).
2. Push this project to the `main` branch.
3. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.

Every push to `main` builds the site and publishes it through `.github/workflows/deploy.yml`.

## Build

```bash
npm run build
```

The output goes to `dist/portfolio/browser`.
