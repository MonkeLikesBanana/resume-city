import type { FillerBuilding } from '../types/attraction'
import { generateBlock } from '../lib/blocks'

// PRD v3 §4.4/§8/§16c — ~26 additional houses lining the Lakeside street,
// deliberately sparser than the Foundry downtown blocks (larger lotSpacing,
// fewer rows) — that lower density is what makes it read as a suburb rather
// than "downtown with houses" (§2). Reuses the twelve unused Suburban-pack
// house variants exported alongside the five real Lakeside attractions.
const HOUSE_MODELS = [
  '/assets/models/suburb/building-type-b.glb', '/assets/models/suburb/building-type-d.glb',
  '/assets/models/suburb/building-type-e.glb', '/assets/models/suburb/building-type-f.glb',
  '/assets/models/suburb/building-type-g.glb', '/assets/models/suburb/building-type-h.glb',
  '/assets/models/suburb/building-type-i.glb', '/assets/models/suburb/building-type-j.glb',
  '/assets/models/suburb/building-type-k.glb', '/assets/models/suburb/building-type-l.glb',
  '/assets/models/suburb/building-type-m.glb', '/assets/models/suburb/building-type-n.glb',
]

const ALONG: [number, number] = [6, 85]

export const SUBURB_HOUSES: FillerBuilding[] = [
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [16, -16], lotSpacing: 12, models: HOUSE_MODELS, seed: 20260917, jitter: 1.5 }),
  ...generateBlock({ along: ALONG, streetAxis: 'z', rowOffsets: [23, -23], lotSpacing: 14, models: HOUSE_MODELS, seed: 20260918, jitter: 1.8 }),
]
