# Vasnova City

Aarav Vaswani’s one-page résumé covers experience, education, and skills. The optional 3D portfolio presents seven stops in a procedural architectural model. A complete text version and a downloadable PDF are available.

[Visit the résumé](https://resume-city.vercel.app)

## Development

The site uses Vite, React 19, TypeScript, React Three Fiber and Drei, and Tailwind CSS v4.

```sh
npm ci
npm run dev
npm run build
npm run lint
```

To regenerate the 1200 × 630 link-preview card on macOS, run `python3 scripts/render-og-image.py` with Pillow installed.

## 3D portfolio

The city uses procedural massing, instanced block and tree geometry, and a static shadow map. It loads only when visitors open the 3D portfolio or follow a city deep link.

Legacy GLB assets are Kenney Creative Commons CC0 packs retained for the earlier city. [Kenney asset licensing](https://kenney.nl/support)
