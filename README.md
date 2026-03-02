# EmvsAnh

A gift and album webapp built for me and my girlfriend.

## Color theme

The app uses a **Valentine red/pink palette** (10 shades) for backgrounds, text, and accents:

| Shade   | Hex       | Use (examples)        |
|---------|-----------|------------------------|
| Lightest| `#FFF0F3` | Light background, dark-mode text |
| …       | `#FFCCD5`, `#FFB3C1`, `#FF8FA3`, `#FF758F` | Muted, borders, light accents |
| Mid     | `#FF4D6D`, `#C9184A`, `#A4133C` | Accents, primary actions, ring |
| Deep    | `#800F2F`, `#590D22` | Dark backgrounds, primary text (light mode) |

- **Light mode** – Pale pink background (`#FFF0F3`), dark red text, soft borders and accents.
- **Dark mode** – Deep red background (`#590D22` / `#800F2F`), pale pink text, brighter accents.

Semantic tokens (`--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--muted`, `--glass-bg`, etc.) are defined in `src/app/globals.css` and used by Tailwind and components.

## Sections

| Section      | Anchor ID     | Purpose                          |
|-------------|---------------|-----------------------------------|
| Home        | `#home`       | Hero and “See moments” CTA       |
| Our Story   | `#our-story`  | Your story and intro             |
| Moments     | `#moments`    | Moment cards (photos + captions)|
| Gallery     | `#gallery`    | Picture gallery                  |
| Letter      | `#letter`     | Personal letter / message        |
| End         | `#end`        | Closing (e.g. “With love, always”)|

The navbar links to these anchors; `html` has `scroll-behavior: smooth` for smooth scrolling.

## Tech stack

- **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**
- **Components** – Custom Button, Card (default + glass), Navbar (desktop + mobile menu), Section, ThemeProvider
- **Utils** – `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Edit `src/app/page.tsx` and section components to add your content and images (e.g. under `public/` or `public/images/`).

## Build

```bash
npm run build
npm start
```
