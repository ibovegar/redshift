# Changelog

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
