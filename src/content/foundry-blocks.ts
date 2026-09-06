import type { FillerBuilding } from '../types/attraction'
import { generateBlock } from '../lib/blocks'

// PRD v3 §4.1/§8/§16b — downtown density scale-up: ~60 filler buildings
// across three depth rows on each side of Main Street (the six real
// attractions keep the ±9 row to themselves). Reuses the full ~35-variant
// Commercial-pack pool now on disk, biasing low-detail variants toward the
// back row (less visual detail needed further from the street, and it helps
// the draw-call budget even with instancing, §12).
const FRONT_MODELS = [
  '/assets/models/filler/building-a.glb', '/assets/models/filler/building-b.glb',
  '/assets/models/filler/building-c.glb', '/assets/models/filler/building-d.glb',
  '/assets/models/filler/building-e.glb', '/assets/models/filler/building-f.glb',
  '/assets/models/filler/building-g.glb', '/assets/models/filler/building-h.glb',
  '/assets/models/filler/building-i.glb', '/assets/models/filler/building-j.glb',
  '/assets/models/filler/building-k.glb', '/assets/models/filler/building-l.glb',
  '/assets/models/filler/building-m.glb', '/assets/models/filler/building-n.glb',
]
const TOWER_MODELS = [
  '/assets/models/filler/building-skyscraper-a.glb', '/assets/models/filler/building-skyscraper-b.glb',
  '/assets/models/filler/building-skyscraper-c.glb', '/assets/models/filler/building-skyscraper-d.glb',
  '/assets/models/filler/building-skyscraper-e.glb',
]
const BACK_MODELS = [
  '/assets/models/filler/low-detail-building-a.glb', '/assets/models/filler/low-detail-building-b.glb',
  '/assets/models/filler/low-detail-building-c.glb', '/assets/models/filler/low-detail-building-d.glb',
  '/assets/models/filler/low-detail-building-e.glb', '/assets/models/filler/low-detail-building-f.glb',
  '/assets/models/filler/low-detail-building-g.glb', '/assets/models/filler/low-detail-building-h.glb',
  '/assets/models/filler/low-detail-building-i.glb', '/assets/models/filler/low-detail-building-j.glb',
  '/assets/models/filler/low-detail-building-k.glb', '/assets/models/filler/low-detail-building-l.glb',
  '/assets/models/filler/low-detail-building-m.glb', '/assets/models/filler/low-detail-building-n.glb',
  '/assets/models/filler/low-detail-building-wide-a.glb', '/assets/models/filler/low-detail-building-wide-b.glb',
]

// Starts at the same distance from the junction as the nearest real
// attraction (Robotics Workshop, x=-16) — leaves the plaza square/junction
// corner clear of downtown filler instead of crowding right up against
// Lakeside's own houses on the other arm (both districts sit close to the
// origin geometrically, even though they're on perpendicular roads).
const ALONG: [number, number] = [-16, -84]

export const FOUNDRY_BLOCKS: FillerBuilding[] = [
  ...generateBlock({ along: ALONG, streetAxis: 'x', rowOffsets: [16, -16], lotSpacing: 8, models: FRONT_MODELS, seed: 20260906 }),
  ...generateBlock({ along: ALONG, streetAxis: 'x', rowOffsets: [23, -23], lotSpacing: 9, models: TOWER_MODELS, seed: 20260907 }),
  ...generateBlock({ along: ALONG, streetAxis: 'x', rowOffsets: [31, -31], lotSpacing: 8, models: BACK_MODELS, seed: 20260908, jitter: 1.8 }),
]
