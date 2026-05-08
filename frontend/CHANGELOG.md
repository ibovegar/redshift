# Changelog

## 2026-05-08

- Ship menu flips to the opposite side of the ship when it would overflow the viewport edge
- Added Details button to ship menu; ship click shows menu, Details triggers zoom
- Ship stats panel appears on opposite side of ship when entering details mode
- Extracted reusable HudPanel component for tactical overlay layout; removed ShipMenuContainer in favor of composition
- Moved spacecraft stat/type labels to data/labels.ts
- Wired ShipStats to real spacecraft API data; added Tellus RX 5 to user spacecrafts
- Added HudCard size prop (small/medium/large) with padding and min-width presets
- Ship selection: ring indicator only shows when ship is selected; click to select, click outside or Escape to deselect
- Simplified asteroid movement condition with shipDocked boolean
- Scan zoom now matches asteroid details zoom (removed extra ship zoom during scan)

## 2026-05-07

- Replaced platinum with antimatter (exotic rarity)
- Darker background on unknown resource cells; transitions to white after reveal animation

## 2026-05-06

- Redesigned scan result panel: solid blue background, white text, 3D tilt effect, larger size
- Moved scan progress bar inside the result panel with SCANNING label
- START MINING button now uses BarButton with matching hover animation
- Click outside scan results panel to dismiss it
- Hide spacecraft menu when pressing Scan; show scan results immediately with "Unknown" during scan
- Added Mining button in ship menu to re-open scan results for scanned asteroids
- Green highlight indicator on all previously scanned asteroids
- Display asteroid stats panel after completing a scan (name, class, mass, density, deposits with abundance)
- Scan button disabled for already-scanned asteroids
- Each asteroid is now a unique entity with ID, name, class, and procedurally generated mining stats
- Asteroid materials include metals, minerals, precious metals, water, CO2, fuel elements, and more
- Extracted reusable `ScanProgressBar` component and `AsteroidHighlight` utility class
- Procedural stat generator with seeded PRNG for deterministic asteroid properties
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
