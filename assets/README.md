# Drop your photos here

Name a file exactly as below (`.jpg`, `.webp` or `.png`). It replaces the
procedural stand-in automatically. Anything missing keeps its stand-in.

| File | Where | Shot |
|---|---|---|
| `hero-building` | Hero, then the OAKLINE wordmark fill | **Transparent PNG/WebP** of a building, sky removed, ~2000px wide |
| `street` | Opening wide strip | Street / plaza, warm light (16:6) |
| `mini-0` … `mini-3` | Four slanted tiles | Interiors / details, 4:3 |
| `portrait` | Movement, tall | Landmark or lifestyle portrait (4:5) |
| `greenhouse` | Movement, wide | Architecture with greenery (16:8.5) |
| `coffee` | Voices | Café / lifestyle, shallow depth of field (16:8.4) |
| `facade` | Buy row | Modern facade (16:6) |
| `profile` | Sell row | Modern home (16:6) |
| `nightflats` | Rent row | Apartment block at dusk (16:6) |
| `bridge` | Journal 1 | Street motion shot (16:9) |
| `parkAve` | Journal 2 | Landmark (16:9) |
| `brownstone` | Journal 3 | Villa at dusk (16:9) |
| `sofa` | Final CTA backdrop | Dark, warm living room (16:9) |
| `listing-1` … `listing-8` | Listing cards | Property photos, 4:3 |

Hero theming (dawn/golden/night) is done with CSS filters on `hero-building`.
`python3 build.py` bakes everything in `assets/` into `dist/oakline.html`.
Use photos you own or that are licensed for reuse (e.g. Unsplash, Pexels).
