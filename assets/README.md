# Drop your photos here

Name a file exactly as below (`.jpg`, `.webp` or `.png`). It replaces the
procedural stand-in automatically. Anything missing keeps its stand-in.

| File | Where | Shot |
|---|---|---|
| `hero-building` | Hero, then the ALOFT wordmark fill | **Transparent PNG** of a terraced rooftop building with plants/pool, ~2000px wide, sky removed |
| `street` | Opening wide strip | Brick row-houses, cars with motion blur, warm light (16:6) |
| `mini-0` … `mini-3` | Four slanted tiles | Interiors / details, 3:2 |
| `portrait` | Movement, tall | Person in red trousers against blue slats (4:5) |
| `greenhouse` | Movement, wide | Lush vertical garden / greenhouse (16:8.5) |
| `coffee` | Voices | Two people with coffee, shallow depth of field (16:8.4) |
| `facade` | Buy row | Classic stone building with autumn tree (16:8) |
| `profile` | Sell row | Side-profile portrait, dark moody bokeh (16:8) |
| `nightflats` | Rent row | Apartment windows at night (16:8) |
| `bridge` | Journal 1 | Bridge + skyline (16:9) |
| `parkAve` | Journal 2 | Tree-lined avenue and towers (16:9) |
| `brownstone` | Journal 3 | Brownstone with stoop (16:9) |
| `sofa` | Final CTA backdrop | Dark, warm living room (16:9) |
| `listing-1` … `listing-8` | Listing cards | Property photos, 4:3 |

Hero theming (dawn/golden/night) is done with CSS filters on `hero-building`.
`python3 build.py` bakes everything in `assets/` into `dist/aloft.html`.
Use photos you own or that are licensed for reuse (e.g. Unsplash, Pexels).
