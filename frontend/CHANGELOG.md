# Changelog

## 2026-05-06

- Asteroid scanning effect with progress bar on Scan button click (random duration based on size, max 10s)
- Docked asteroid shows blue additive highlight overlay (same as travel hover)
- Dock button disabled when at home dock, Scan button disabled when not at asteroid
- Static 3D perspective transform on ship tooltip
- Docked menu dismisses on Escape or click outside
- Increased ship travel speed (0.0004 → 0.001 per frame)
- Increased ship parking distance from asteroid (0.12 → 0.22)
- Made the menu-to-ship connector line dashed
- Increased spacecraft menu hover animation (longer duration and wider stagger)
- Ship turns to face cursor while in travel mode (before selecting a target)

## 2026-05-05

- Refactored ship into reusable `Ship` class (`TacticalBackground/Ship.ts`)
- Travel line tapers with perspective (thicker near ship, thinner at target)
- Added blue additive highlight overlay on hovered asteroid in travel mode
- Added static tooltip above ship with label + fading line indicator
- Tooltip uses primary color background with white text
- Block ring fades partially on hover, fully on zoom
- Zoom-out uses smootherstep easing with velocity-based deceleration
- Reduced ship bob motion when zoomed in
- Travel line styled to match ship's dashed ring (short cyan dashes with glow layer)
- Tooltip hidden when zoomed in, reappears only on re-hover
- Added ship action menu (Travel, Dock, Scan) when zoomed in
- Travel mode: zoom out, dotted line from ship to cursor
- Asteroid hover highlighting in travel mode
- Ship moves to clicked asteroid with eased animation
