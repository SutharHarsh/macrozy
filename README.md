# Macrozy marketing site

React + TypeScript + Vite. Smooth scroll with Lenis, scroll progress with GSAP ScrollTrigger, and a hand-written 2D canvas particle engine for the home story.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/
```

## Pages

| Route | What it is |
|---|---|
| `/` | Hero, the pinned 8-chapter story (one lunch, start to finish), portions demo, feature bento, steps, principles, pricing, FAQ |
| `/features` | Eight features with a sticky phone that swaps screens as you scroll |
| `/food` | Food explorer: 20 Indian dishes, unit switching, rolling macros |
| `/science` | Live target calculator (mirrors `MacroCalculator` in the Flutter app), BMI policy, streak rules, privacy |
| `/pricing` | Free vs Pro, billing toggle, trial timeline, comparison table, FAQ |
| `/download` | Play Store link and an iPhone waitlist form (client-side only) |

## Where things live

- `src/lib/story.ts` – chapter table (`len`, `ts`), progress → story time `g`, weights, the store, touch chase
- `src/lib/motion.ts` – Lenis setup (skipped on touch and reduced motion), helpers
- `src/canvas/formations.ts` – particle formations: thali, gap, viewfinder, split, decide, meters, trend, ring
- `src/canvas/ParticleField.ts` – the canvas renderer
- `src/components/story/` – the pinned stage and each chapter's copy and phone screen
- `src/components/phone/` – the dark app UI, rebuilt in HTML/CSS from the app's design tokens
- `src/styles/tokens.css` – colours, type, spacing, motion

## Before launch

- Replace the Play Store URL in `src/pages/Download.tsx` and the contact email in `src/components/Footer.tsx`.
- Confirm the iPhone status (the site says "coming soon").
- The waitlist form has no backend yet; wire `submit` in `Download.tsx` to your API.
- Dish values in `src/data/dishes.ts` and the example meal are marked illustrative; swap in reviewed data if you want real numbers.
