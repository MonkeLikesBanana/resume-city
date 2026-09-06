import type { FillerBuilding } from '../types/attraction'

// PRD v3 §4.1/§4.4/§8 — a small seeded grid generator shared by the Foundry
// downtown blocks (denser: smaller spacing, more rows) and the Lakeside
// suburb blocks (sparser: larger spacing, fewer rows) — one generator, two
// parameter sets, rather than ~86 hand-placed entries.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface BlockSpec {
  /** street-facing coordinate where the block's first row starts (world X for
   * a 'z'-running street's cross rows, or world Z for an 'x'-running street) */
  along: [number, number] // [start, end] along the street's own axis
  streetAxis: 'x' | 'z' // which axis the street itself runs along
  /** signed row offsets from the street centerline, one row of lots per entry */
  rowOffsets: number[]
  lotSpacing: number // meters between lot centers along the street axis
  models: string[]
  seed: number
  jitter?: number // +/- meters of random position jitter per lot (default 1.2)
  rotationJitter?: number // +/- radians of random rotation jitter (default 0.15)
  scale?: number
}

export function generateBlock(spec: BlockSpec): FillerBuilding[] {
  const rand = mulberry32(spec.seed)
  const jitter = spec.jitter ?? 1.2
  const rotJitter = spec.rotationJitter ?? 0.15
  const scale = spec.scale ?? 3
  const [start, end] = spec.along
  const lotCount = Math.max(1, Math.round(Math.abs(end - start) / spec.lotSpacing))
  const dir = end >= start ? 1 : -1

  const buildings: FillerBuilding[] = []
  for (const rowOffset of spec.rowOffsets) {
    // Each row faces the street: rotationY 0 faces +z-running streets from
    // the +row side inward, Math.PI from the -row side — matches the
    // NORTH/SOUTH convention already used by the hand-placed Foundry filler.
    const baseRotation = spec.streetAxis === 'z' ? (rowOffset > 0 ? Math.PI : 0) : rowOffset > 0 ? -Math.PI / 2 : Math.PI / 2

    for (let i = 0; i < lotCount; i++) {
      const alongPos = start + dir * (spec.lotSpacing / 2 + i * spec.lotSpacing)
      const model = spec.models[Math.floor(rand() * spec.models.length)]
      const posJitter = (rand() - 0.5) * 2 * jitter
      const rotJitterVal = (rand() - 0.5) * 2 * rotJitter
      const scaleJitter = scale * (0.92 + rand() * 0.16)

      const position: [number, number, number] =
        spec.streetAxis === 'z'
          ? [rowOffset + posJitter, 0, alongPos]
          : [alongPos, 0, rowOffset + posJitter]

      buildings.push({
        model,
        position,
        rotationY: baseRotation + rotJitterVal,
        scale: scaleJitter,
      })
    }
  }
  return buildings
}
