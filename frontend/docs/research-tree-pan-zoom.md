# Research tree: pan & zoom options

Decision record for the ResearchTree interactivity stack.

## Context

The research tree currently uses [ReactFlow](https://reactflow.dev/) for rendering nodes/edges, panning, and viewport math. We considered ripping it out when the only interactivity was bounded vertical pan. Adding zoom (pinch, scroll-wheel, double-click) changes the trade-off — this doc captures the three options so we don't re-derive them next time.

## What ReactFlow does *not* do for us

- **Layout** — `(x, y)` positions are computed by `layout.ts` (subtree-centered horizontal tree). ReactFlow has no built-in tree layout; you'd need `dagre` or `elkjs` to swap it out, and neither produces the same shape.
- **Per-node-type dimensions** — we have two node sizes (card vs ship group); the layout pass owns this.
- **Handle alignment** — because the node label is rendered *outside* the visual box (EVE-ISIS style), the node bbox center isn't the box's vertical center. We override `top` on every Handle via `getBoxCenterY` to fix this.

These survive any choice below.

## What ReactFlow *does* do for us

- Pan with `translateExtent` bounding
- Zoom (currently disabled; trivially re-enabled by flipping three flags + unlocking `minZoom`/`maxZoom`)
- `fitView` (auto-zoom + center on mount)
- SVG path rendering with `getSmoothStepPath` / `BaseEdge`
- Background grid (we layered three `<Background>` components for the EVE look)

Cost: ~40 KB gzipped on the bundle, and a handful of abstraction quirks (handle-offset workaround, label-outside fight, fitView flash).

## The three options

### 1. Keep ReactFlow

**Effort to add zoom:** flip `zoomOnScroll`, `zoomOnPinch`, `zoomOnDoubleClick` to `true` and remove (or widen) `minZoom`/`maxZoom`. Zero new code.

**Pros:** already integrated, custom edge and node infrastructure stays as-is, fitView keeps working.

**Cons:** ~40 KB bundle, custom-edge / handle-offset workarounds stay in place.

### 2. Custom pan/zoom (DIY)

A wrapper `<div>` with `overflow: hidden` containing an inner `<div>` styled with `transform: translate(${x}px, ${y}px) scale(${scale})`. State holds `{ x, y, scale }`.

**Handlers needed:**
- `onPointerDown` / `onPointerMove` / `onPointerUp` for drag pan (~30 lines)
- `onWheel` for zoom, with zoom-to-cursor math so the point under the cursor stays fixed (~20 lines — this is the only non-trivial bit)
- Bounds clamping that accounts for the current scale (~15 lines)

Plus: replace ReactFlow's `<Background>` with `repeating-linear-gradient` (~10 lines), and replace `BlueprintEdge` with a plain `<svg>` overlay containing one `<path>` per edge using the layout's source/target coords.

**Total:** ~80–100 lines for a polished implementation. ~50 lines if you skip zoom-to-cursor (zooms from origin, feels noticeably worse).

**Pros:** ~40 KB bundle savings, full control over every interaction, no more handle-offset / label-outside workarounds, edges become plain SVG.

**Cons:** new code to own and maintain, edge cases (touchpad pinch via `ctrlKey + wheel`, mobile pinch via two-pointer events, momentum scrolling) all on us.

### 3. `react-zoom-pan-pinch`

[Library link.](https://www.npmjs.com/package/react-zoom-pan-pinch) ~10 KB gzipped. A single `<TransformWrapper>` / `<TransformComponent>` pair gives pan, zoom, pinch, bounds, and zoom-to-cursor out of the box. Tree nodes stay as absolutely-positioned divs; edges stay as a sibling `<svg>`.

```tsx
<TransformWrapper minScale={0.5} maxScale={2} limitToBounds>
  <TransformComponent>
    {/* tree with absolute-positioned nodes + SVG edge overlay */}
  </TransformComponent>
</TransformWrapper>
```

**Pros:** ~30 KB bundle savings vs ReactFlow, ~10 lines of integration, all the gestures handled, no custom pointer-event code to maintain.

**Cons:** another dependency, less idiomatic than rolling your own if you enjoy that.

## Recommendation

The trade-off pivots on **how much you want to keep customizing the tree's look and feel**.

- If the tree is feature-complete visually and the goal is just "ship it, with zoom" → **keep ReactFlow**, flip the zoom flags.
- If you want to keep evolving the edge style / background / interactions without fighting the abstraction → **`react-zoom-pan-pinch`** is the sweet spot. Custom edges become trivial SVG, the background is just CSS, and you still get zoom/pan for free.
- If you'd seriously enjoy owning the pan/zoom code (or want zero dependencies) → **DIY**. It's not that long.

Earlier when only vertical pan was in scope, DIY was the obvious answer. With zoom-to-cursor + pinch in scope, the library options earn their keep again.

## What stays regardless

- `layout.ts` — tree position math (`layoutSubtree`, `LAYOUT`, `TRANSLATE_EXTENT`, `getBoxCenterY`)
- `constants.ts` — sizes, colors, frame chrome
- Per-component folders (`NodeFrame/`, `CardNode/`, `ShipGroupNode/`, `BlueprintEdge/`, `ResearchCard/`)

Only `ResearchTree.tsx` (the wiring/assembly file) changes when swapping the interactivity layer.
