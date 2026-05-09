# Changelog

## 2026-05-09

- Added mining summary screen (HudCard) shown after drill ends — displays extracted resources with rarity colors, amounts, and storage cost
- Drill health reaching 0 now ends the game (previously only timer/completion/escape)
- Summary shows different status labels: extraction complete, time expired, drill destroyed, or aborted
- Added ship storage system: cargo capacity, cargo items, storage cost per material (scaled by rarity)
- Added cargo hold section to ShipStats with usage bar, material list with symbols and rarity colors
- Mining completion now fills ship cargo (respects capacity limits)
- Moved Continue button to the left in mining summary
- Mining summary now only shown on timeout or drill destruction (not on abort or completion)
- Drill intro/tutorial only shown on first mining attempt (persisted via user data)
- Removed dev MiningSummary preview from tactical scene
- Mining now requires scanning — mining button disabled until asteroid is scanned
- Removed dev auto-start mining and direct-click-to-mine shortcut
- Camera zooms into asteroid before drill overlay appears (zoom-in animation plays first)
- Added PATCH endpoint for spacecraft cargo via MSW mock API
- Extracted DrillIntro into separate component with MUI (Backdrop, Typography, Stack, List, HudButton)
- Merged far and near asteroid belts into a single unified belt (750 asteroids)
- Replaced mining minigame with Thermal Resonance: laser heat gauge with moving optimal zone, overheat fracture penalty, glowing cracks visual
- Added Vector Drill minigame: tunnel visualization, moving target tracking, drill health, screen shake, sparks
- Enhanced Vector Drill with pressure strikes (click QTE), fracture hazards (dodge zones), and orbit bonus (circular mouse movement)
- Persist drill tutorial seen flag via mock API so intro only shows on first mining attempt

## 2026-05-08

- Added MiningOverlay minigame: concentric ring targets, cursor push mechanic, per-deposit depletion, countdown timer
- Added asteroid `depleted` flag; depleted asteroids disappear from belt rendering
- Added scan flash effect on asteroid highlight when scanning starts
- Added fuel/hull/shield consumption during ship travel (shield absorbs before hull)
- Wired START MINING button to mining overlay with camera zoom toward asteroid
- Refactored TacticalBackground.tsx into smaller modules: asteroid-belt, CameraZoom, create-planet, create-sun, create-god-rays, create-lens-flare, create-solar-wave
- Renamed TacticalBackground helper files to kebab-case: asteroid-highlight, camera-zoom, scanned-indicators, ship, solar-event
- Converted factory functions to classes: Planet, Sun, GodRays, LensFlare, SolarWave (with dispose methods)
- Moved TacticalBackground scene modules into scene/ subfolder
- Moved scan overlay/reveal CSS from inline `<style>` to Emotion keyframes in ScanResult
- Extracted ShipTooltip and ConnectorLines components from TacticalBackground JSX
- Moved Exit button into ShipStats header
- Created FullscreenLayer styled component; applied to Three.js container and ConnectorLines SVG
- Extracted AsteroidBelts, Stars, TravelLine classes and SceneUI helpers from TacticalBackground
- Ship menu flips to the opposite side of the ship when it would overflow the viewport edge
- Added Details button to ship menu; ship click shows menu, Details triggers zoom
- Ship stats panel appears on opposite side of ship when entering details mode
- Extracted reusable HudPanel component for tactical overlay layout; removed ShipMenuContainer in favor of composition
- Moved spacecraft stat/type labels to data/labels.ts
- Wired ShipStats to real spacecraft API data; added Tellus RX 5 to user spacecrafts
- Added solar event system with radiation warnings, expanding wave overlay, and sun/asteroid/planet visual effects
- Removed commented-out dead code from TacticalBackground
- Extracted showMenu/hideMenu helpers, replacing 12 duplicated menu toggle patterns
- Moved solar wave animation state and logic into SolarWave.update() method
- Added HudCard size prop (small/medium/large) with padding and min-width presets
- Ship selection: ring indicator only shows when ship is selected; click to select, click outside or Escape to deselect
- Simplified asteroid movement condition with shipDocked boolean
- Scan zoom now matches asteroid details zoom (removed extra ship zoom during scan)
- Added strobe light indicator for unselected ships (double-blink pattern with god ray glare shader)
- Fixed planet drag rotation to only trigger on clicks directly on the planet
- Ship tooltip hidden when ship is selected
- Reordered ship menu buttons: Move, Scan, Mining, Dock, Details
- Ring indicator hidden during scanning, mining, and travel actions
- Ring indicator scales down when camera zooms in
- Disabled ship deselection during active scan; added abort scan button
- Ring indicator scales based on camera-to-ship distance
- Added solar event system with random cosmetic flares, radiation warning countdown, and hull damage
- Disabled ship deselection during active scan; added abort scan button

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
