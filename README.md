# ALOFT — Live Above It

A cinematic, scroll-driven real-estate site. Zero dependencies, zero build step.

- Open `index.html` directly, or `dist/aloft.html` (everything inlined in one file).
- `python3 build.py` regenerates `dist/aloft.html`.
- Add `?nopre` to skip the preloader, `?t=night|dawn|golden|day` to set the hero time of day.

**Features:** preloader · scroll-scrubbed hero (zoom, outlined wordmark, cloud rise, building-filled wordmark) · time-of-day switcher (T key) · word-by-word scroll reveals · slanted image tiles · sticky process steps · Buy/Sell/Rent accordion · testimonial carousel · draggable 3D-tilt listings with filters + saved homes · live mortgage calculator · neighborhood vibe finder · Ctrl/⌘K command palette · custom cursor, magnetic buttons, confetti · responsive.

All imagery is generated procedurally in `js/art.js` (swap for real photos any time).
