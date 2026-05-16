---
applyTo: "**"
---

# Project Context for AI Assistants

## Code Style

- Always match the formatting of existing code when editing files
- Check for formatter configs (biome.json, .prettierrc, .editorconfig) before writing new files
- Never assume defaults — read the actual config or existing code patterns
- **When biome.json exists**: read it FIRST and format all code edits to match its settings (indent style/width, quotes, semicolons, trailing commas, line width). Do NOT rely on the formatter to fix your output — write correctly formatted code from the start.
- The on-disk file contents may differ from the config if a formatter hasn't run yet — always trust the config over the file contents.

## Project Reference

### Tech Stack
- React 19 + TypeScript 6 (strict mode)
- Vite 8 (port 3000, output to `build/`)
- MUI v9 + Emotion (dark theme default)
- TanStack React Query v5
- React Router v7 (BrowserRouter)
- Three.js for 3D viewer
- MSW v2 for API mocking (no real backend)
- pnpm package manager

### Formatting (Biome 2)
- 2 spaces, line width 120
- Single quotes, no semicolons, no trailing commas

### Scripts
- `pnpm start` — dev server
- `pnpm build` — typecheck + build
- `pnpm typecheck` — tsc --noEmit
- `pnpm lint` / `pnpm lint:fix` — biome check

### TSConfig
- ESNext target/module, bundler resolution
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- `noImplicitAny: false`, `noImplicitReturns: false`
- `baseUrl: "src"` — absolute imports from src/

### Architecture
- `components/` — presentational, each in own folder (Component/Component.tsx)
- `containers/` — page-level/smart components (App, Engineering, Inventory, Marketplace, Tactical)
- `hooks/` — custom hooks wrapping TanStack Query
- `models/` — TS types/interfaces
- `api/` — API modules, default export as namespace object
- `mocks/` — MSW browser worker, handlers, mock data
- `ui/theme/` — MUI theme configs (dark/light)
- `utils/` — guards and helpers

### Conventions
- Named exports everywhere (no default exports for components/hooks)
- Components barrel: explicit named re-exports; Models barrel: `export *`
- MSW starts before React renders
- CartProvider context wraps the app
- Suspense at top level
- Lefthook: typecheck on commit, lint on push
- Child components always live in their own subfolder (`Component/Component.tsx`), even when nested inside a parent component's folder (e.g. `StationBuildMenu/SectionCard/SectionCard.tsx`). Shared non-component files (constants, helpers) sit at the parent folder root.

---

## Tactical 3D Scene — Tweaked Values Reference

All visual config lives in `src/containers/Tactical/TacticalBackground/TacticalBackground.tsx`.

### Camera
- FOV: 38° | Near/Far: 0.1–1000
- Initial Z: 5, panning range ±0.3 (mouse-driven)
- Smooth lerp: 3% per frame

### Planet (Mars-like)
- Position: (−13.5, −4.5, −55) | Radius: 18.5 | Scale X: 0.94
- Texture: 8k_mars.jpg, 128×128 subdivisions
- Sun direction in shader: (2.0, 1.2, −0.8)
- Color tint: (0.4, 0.5, 1.5) — boosted blue
- Dark side color: (0.15, 0.25, 0.6)
- Light falloff: smoothstep(−0.15, 0.45) × 2.5
- Base rotation X: 0.3 rad, auto Y: +0.00005 rad/frame
- Atmosphere radius: 19.2, color (0.8, 0.8, 0.73), additive blend
- Cloud radius: 18.7, threshold smoothstep(0.15, 0.65), independent rotation

### Sun (multi-layered)
- Position: (11.5, 5, −20)
- Core: exp(−d×90)×2.0
- 16 spike rays: pow(cos(angle), 100)
- 5 asymmetric long rays (lengths: 2.5, 8.0, 4.0, 10.0, 3.0)
- Base color: (1.0, 0.93, 0.87)
- God rays: 50 samples, density 0.55, weight 0.12, decay 0.94, exposure 0.6
- Lens flare: 8 ghost elements, intensity 0.4
- Horizontal streak + 4-fold burst rays

### Far Asteroid Belt
- Count: 600 | Speed: 0.00025/frame
- Base radius: 0.015, scale range 0.15–2.65 per axis
- Spread: X±4.8, Y±1.2, Z±0.9 | Y offset: −0.2
- Arc: −2.7×(t−0.5)²+0.66+(t−0.5)×0.9
- Material: 16 texture chunks, color (0.68, 0.8, 1.0), roughness 0.7
- Parallax: 60% of camera movement

### Near Asteroid Belt
- Count: 150 | Speed: 0.00045/frame (1.8× faster)
- Base radius: 0.024, scale ×1.4
- Spread Y: ±1.08 | Y offset: −0.5 | Z offset: +0.6
- Arc: positive (opposite curve)
- Roughness: 0.65 | Parallax: 50% of camera movement

### Scene Lighting
- Main directional: (12, 4, −10), intensity 7
- Fill directional: (−10, −2, 5), intensity 1.5, color (0.4, 0.4, 0.4)
- Ambient: color (0.27, 0.33, 0.4), intensity 0.8

### Stars Background
- Texture: 8k_stars_milky_way.jpg
- Position: (−1, 2, −76), flat plane with parallax

### Render Pipeline
1. Occlusion pass (half-res, sun white / planet black)
2. Main scene
3. God rays (additive)
4. Lens flare (additive)

### Interaction
- Planet drag rotation: 0.0015 rad/pixel, velocity damping 4%/frame
- 2D mission tag positions in `tag-positions.ts`

### Ship (Tellus RX 5)
- Model: `/models/tellrx5.glb`
- Position: (1.2, 0.25, −3.5) | Rotation: (0.1, −0.6, 0.05) | Scale: 0.012
- Hover animation: Y bobs ±0.03 (sin, 0.4 Hz), Z roll ±0.01 (sin, 0.25 Hz)

### Ship Ring Indicators
- Group position follows ship Y; rotation tilt: (0.7, −0.4, 0.2)
- **Glowing torus:** radius 0.35, tube 0.008, color 0x66ddff, opacity 0.9, additive, rotates Z at 0.3 rad/s
- **Shader reticle:** 1×1 plane, dual rings (smoothstep 0.34–0.38 + 0.40–0.42), pulse 0.7+0.3×sin(t×2), color (0.5, 0.9, 1.0), hover fill disc (0.05, 0.12, 0.35) at 55% opacity, normal blending
- **Dashed circle:** radius 0.28, dash 0.04, gap 0.03, color 0xaaeeff, opacity 0.85, additive, rotates Y at 0.2 rad/s
- **Hit disc:** CircleGeometry radius 0.4, invisible, used for raycast click/hover detection

### Ship Zoom
- Camera target: (1.2, 0.26, −3.1) — 0.4 units from ship
- Default camera Z: 5
- Zoom speed: 0.01/frame
- Easing: ease-out power 9 (`1 - (1-t)^9`) — fast start, very slow approach
- Click hitDisc to toggle zoom; click elsewhere or Escape to zoom out
- Panning disabled while zoomed
