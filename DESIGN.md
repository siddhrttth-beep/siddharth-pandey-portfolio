# Design system — siddharth pandey

HTML and CSS only. No JavaScript. Two files: `index.html`, `style.css`.

## Idea
One big custom-lettered word per section, everything else in small DM Mono. Full-bleed colour blocks, one illustration and one "app card" per block. Modelled on remote-rituals.framer.website.

## Type
| role | font | size |
|---|---|---|
| all text | DM Mono 500, written lowercase, tracking −0.04em, line-height 1.1 | 12.8 / 14.4 / 16px |
| numbers in card bars | Space Mono 700, tracking −2px, word in grey | 40px / 42px |
| headings | custom SVG lettering in `assets/lettering/` (drawn for this site, not a font) | ~88px in cards, full width in hero and ending |

There are no middle sizes: no subheadings, no section titles.

## Colour
Each section takes its colour from its illustration's own background, so art and section meet with no seam.

| token / section | value |
|---|---|
| `--hero` gate, first and last screen | `#fe3d38` |
| `--ink` dark sections, card bars, text | `#1a1a1a` |
| work | `#0499fd` |
| brand | `#f8c035` |
| skills | `#7aca2d` |
| school + certs | `#ae6cff` (the studied illustration was recoloured from pink to this violet; the pink original is not in this repo) |

## Shape
- Radius: 6px (bars, icon squares) · 8px (nav, buttons) · 10px (rows) · 12px (windows) · 15px (cards, tiles, bubbles).
- Page gutter `clamp(10px, 2.8vw, 40px)`.
- App card: max 500px (wide card 1040px). Dark bar 80px, white body with 15px padding: lettering, one paragraph, rows. Row: 46px black square (burst, or a logo), title, grey line.
- Mac window: white 28px bar with three dots and a file name. Used for the hero portrait and the ending illustration.

## Parts
- **Gate**: a macOS desktop (menu bar, drifting wallpaper in the site colours, dock) with a faithful dark Terminal window. "enter portfolio" minimises the window to the dock.
- **Nav** sits at the top of the hero and scrolls away with it (as in the reference): name + LinkedIn, GitHub, CV in one white bar, then "let's talk".
- **Hero**: the portrait leads (right on desktop, under the name on phones). Nine invisible hover zones tilt the window towards the cursor in 3D; on touch screens it sways. Three stickers pop on hover.
- **Shipped! (video call)**: four tiles flip to the real screenshot and link out (sanriya.in, @sanriyafinvest). Call controls are checkboxes: camera off greys the tiles, mute swaps the mic icons, the smile sends floating reactions, the hand raises a toast, the red button leaves the call for the contact section.
- **Ending terminal**: a Mac Terminal window that prints `cat contact.txt` line by line as it scrolls into view; every line is a real link.
- **Logos**: Google and HubSpot are the official marks (Simple Icons, CC0, loaded from jsDelivr and tinted with CSS masks). The rest are monograms in the same black squares.
- **Ribbon**: a marquee between side quests and the ending.

## Motion (CSS only)
- Ease-out `cubic-bezier(0.23, 1, 0.32, 1)`.
- Gate: a terminal types two commands with keyframes, then shows "enter portfolio →". That label ticks a hidden checkbox; `:checked` fades the gate and starts the hero entrance. Until then `:has()` locks scrolling.
- Sideways run (any screen at least 540px tall: phones get compact panels with tap-to-read rows, upright tablets stack art over card, wide screens put them side by side; each panel's art swings in and out in 3D, cards and rows follow, a big outlined number drifts behind, a progress bar fills): work, brand, skills, studied, certs and side quests pin and slide right-to-left as you scroll, like the reference. A tall `.hs` wrapper defines a `view-timeline`; `.hs__track` translates along it. Smaller screens, reduced motion and browsers without scroll-driven animations get the same scenes stacked vertically.
- On scroll: cards, tiles and lettering rise in with `animation-timeline: view()`, inside `@supports` and `prefers-reduced-motion: no-preference`.
- Illustrations float 10px. The ending terminal's caret blinks, the paper plane drifts, the coffee steams.
- Reduced motion: nothing moves, nothing is hidden.
