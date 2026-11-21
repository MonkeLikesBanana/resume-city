# Vasnova City

Aarav Vaswani’s scroll-driven guided tour covers education, robotics, teamwork, and current projects. The architectural city model follows the story when WebGL is available. The HTML story and résumé PDF are always available.

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

The city uses procedural massing, instanced block and tree geometry, and a static shadow map. The decorative city loads separately from the story. Existing city URLs lead to the same document.

Legacy GLB assets are Kenney Creative Commons CC0 packs retained for the earlier city. [Kenney asset licensing](https://kenney.nl/support)
