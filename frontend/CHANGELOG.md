# Changelog

## 2026-05-05

- Refactored ship into reusable `Ship` class (`TacticalBackground/Ship.ts`)
- Added static tooltip above ship with label + fading line indicator
- Tooltip uses primary color background with white text
- Block ring fades partially on hover, fully on zoom
- Zoom-out uses smootherstep easing with velocity-based deceleration
- Reduced ship bob motion when zoomed in
- Tooltip hidden when zoomed in, reappears only on re-hover
