import { ExtrudeGeometry, Shape, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { ResumeEntryId } from '../../content/resume'

export const MODEL_PALETTE = {
  background: '#e6e3dc',
  plinth: '#d9d6cf',
  blocks: '#efede7',
  building: '#f6f4ef',
  water: '#c4d0d4',
  glass: '#bac3c3',
  selected: '#b5c6be',
} as const

type Point = [number, number]
type Part = BufferGeometry

function extrusion(points: Point[], depth: number) {
  const shape = new Shape()
  shape.moveTo(...points[0])
  for (const point of points.slice(1)) shape.lineTo(...point)
  shape.closePath()
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
}

function footprint(points: Point[], height: number, base = 0): Part {
  return extrusion(points.map(([x, z]) => [x, -z]), height).rotateX(-Math.PI / 2).translate(0, base, 0)
}

function slab(x: number, z: number, width: number, depth: number, height: number, base = 0): Part {
  return footprint([[x, z], [x + width, z], [x + width, z + depth], [x, z + depth]], height, base)
}

function parapet(x: number, z: number, width: number, depth: number, base: number): Part[] {
  const thickness = .09
  return [
    slab(x, z, width, thickness, .13, base),
    slab(x, z + depth - thickness, width, thickness, .13, base),
    slab(x, z + thickness, thickness, depth - thickness * 2, .13, base),
    slab(x + width - thickness, z + thickness, thickness, depth - thickness * 2, .13, base),
  ]
}

function combine(parts: Part[]) {
  const geometry = mergeGeometries(parts)
  for (const part of parts) part.dispose()
  geometry.computeBoundingBox()
  return geometry
}

const signature: Record<ResumeEntryId, () => Part[]> = {
  // Pavilion with an open colonnade and a stepped public terrace.
  'welcome-plaza': () => [
    slab(-4.6, -2.8, 9.2, 5.6, .16),
    slab(-4, -2.6, 8, 4.3, .2, .16),
    slab(-3.8, -2.2, 7.6, 2.25, .45, 2.65),
    slab(-3.5, -2, 7, .45, 2.29, .36),
    ...[-3.35, -1.7, 0, 1.7, 3.35].map(x => slab(x - .12, -.4, .24, .24, 2.29, .36)),
  ],
  // Three raised sawtooth profiles and a recessed opening between the bay piers.
  'robotics-workshop': () => [
    slab(-4.25, -2.7, 8.5, 4.45, 2.75),
    slab(-4.25, 1.75, 1.6, .9, 2.75),
    slab(2.65, 1.75, 1.6, .9, 2.75),
    slab(-2.65, 1.75, 5.3, .9, .65, 2.1),
    ...[-4.25, -1.42, 1.41].map(x => extrusion([[x, 2.75], [x + 2.83, 2.75], [x + 2.83, 4.15]], 5.35).translate(0, 0, -2.7)),
  ],
  // Stacked laboratory and studio bars with a recessed entry.
  'neemo-hq': () => [
    slab(-3.5, -2.25, 7, 4.5, .24),
    slab(-3.2, -1.9, 6.4, 3.3, 1.7, .24),
    slab(-3.45, -2.05, 6.55, 4.15, 1.35, 1.94),
    slab(-2.65, -1.75, 3.6, 2.35, .62, 3.29),
    ...parapet(-2.59, -1.69, 3.48, 2.23, 3.91),
  ],
  // Low connected campus wings enclose an open court under a taller commons.
  'academic-hall': () => [
    footprint([[-5.15, -3.4], [5.2, -3.4], [5.2, 3.25], [2.9, 3.25], [2.9, -1.25], [-2.6, -1.25], [-2.6, 3.25], [-5.15, 3.25]], 2.1),
    slab(-1.75, -3.3, 4.05, 1.9, 1.02, 2.1),
    ...parapet(-1.69, -3.24, 3.93, 1.78, 3.12),
    slab(-5.15, 1.35, 2.55, 1.9, .7, 2.1),
    slab(-2.55, 2.55, 5.4, .42, .24, 1.55),
  ],
  // Fabrication hall with a raised clerestory monitor and attached studio.
  'makers-club': () => [
    slab(-4.25, -2.8, 6.25, 5.6, 2.05),
    slab(-3.85, -2.5, 4.85, 3.1, 1.28, 2.05),
    slab(-4.05, -2.55, 5.2, 3.45, .23, 3.33),
    slab(2, -1.75, 2.25, 4.05, 1.55),
    slab(-4.3, 2.7, 6.45, .7, .18, 1.85),
  ],
  // Stepped civic block set back from its entrance plaza.
  'deca-center': () => [
    slab(-4.3, -3.1, 8.6, 6.15, .22),
    slab(-4, -2.85, 8, 4.95, 1.6, .22),
    footprint([[-3.9, -2.65], [3.8, -2.65], [3.8, 1.65], [-1, 1.65], [-1, .65], [-3.9, .65]], 2.05, 1.82),
    slab(-3.65, -2.5, 4.8, 2.85, 1.4, 3.87),
    slab(-3.52, -2.4, 2.6, 2.45, .72, 5.27),
    ...parapet(-3.46, -2.34, 2.48, 2.33, 5.99),
  ],
  // A community hall and smaller learning wing sharing a covered entrance.
  'fll-center': () => [
    footprint([[-4.55, -2.65], [4.55, -2.65], [4.55, -.3], [1.7, -.3], [1.7, 2.65], [-4.55, 2.65]], 1.75),
    slab(-4.25, -.3, 5.65, 2.65, 1.04, 1.75),
    slab(1.7, -.28, 2.55, 1.9, .22, 1.53),
    slab(4, 1.18, .2, .22, 1.53),
  ],
}

export const SIGNATURES = Object.fromEntries(Object.entries(signature).map(([id, make]) => [id, combine(make())])) as Record<ResumeEntryId, BufferGeometry>

export const BLOCK_LOCATIONS = Array.from({ length: 8 }, (_, i) => 20 - i * 13)
export const PARCELS = combine(BLOCK_LOCATIONS.flatMap(x =>
  [-14, 2].map(z => slab(x - 5.7, z, 11.4, 12, .055, -.055)),
))
export const TYPICAL_MASS = combine([
  slab(-.5, -.5, 1, 1, .72),
  slab(-.44, -.48, .82, .78, .28, .72),
])
// Cover the whole visible ground beyond the model. The shoreline remains a
// separate material break, with no exposed back or side edges in the frustum.
export const GROUND = slab(-400, -400, 800, 800, .15, -.15)
export const WATER = footprint([
  [-400, -400], [400, -400], [400, -15.4], [29, -15.4], [12, -15.4],
  [3, -16], [-16, -15], [-34, -16.1], [-54, -15.3], [-79, -16.3], [-400, -16.3],
], .008)

export const INFILL = BLOCK_LOCATIONS.flatMap((x, i) => [
  { position: new Vector3(x + 2.3, 0, -11.5), scale: new Vector3(3.1, 2.5 + i % 3, 2.5) },
  { position: new Vector3(x - 3.2, 0, -11.8), scale: new Vector3(2.4, 2 + i % 2, 2.8) },
  { position: new Vector3(x + 2.55, 0, 12), scale: new Vector3(3, 1.8 + i % 3 * .55, 2.6) },
  { position: new Vector3(x - 2.7, 0, 11.7), scale: new Vector3(2.8, 1.5 + i % 2 * .9, 2.1) },
])

// Glass sits just behind the raised sill and mullion faces.
function facade(x: number, z: number, width: number, base: number, height: number, bays: number) {
  const step = width / bays
  return {
    glass: [slab(x, z + .012, width, .026, height, base)],
    trim: [
      slab(x - .055, z, width + .11, .09, .075, base - .055),
      slab(x - .055, z, width + .11, .09, .075, base + height - .02),
      ...Array.from({ length: bays + 1 }, (_, i) =>
        slab(x + i * step - .035, z, .07, .072, height, base)),
    ],
  }
}

const fenestration: Record<ResumeEntryId, ReturnType<typeof facade>[]> = {
  'welcome-plaza': [facade(-1.8, -1.55, 3.6, .65, 1.45, 4)],
  'robotics-workshop': [
    facade(-4, 2.65, 1.08, 1.55, .58, 2),
    facade(2.88, 2.65, 1.12, .16, 1.65, 2),
    ...[-1.42, 1.41, 4.24].map(x => {
      const monitor = facade(-2.45, 0, 4.9, 2.95, .93, 6)
      for (const part of [...monitor.glass, ...monitor.trim]) part.rotateY(Math.PI / 2).translate(x + .008, 0, -.025)
      return monitor
    }),
  ],
  'neemo-hq': [
    facade(-.77, 1.4, 1.2, .25, 1.5, 2),
    facade(-2.98, 2.1, 5.58, 2.22, .72, 5),
  ],
  'academic-hall': [
    facade(-4.88, 3.25, 1.95, .87, .69, 3),
    facade(3.16, 3.25, 1.78, .87, .69, 3),
    facade(-1.2, -1.25, 2.75, .12, 1.65, 4),
  ],
  'makers-club': [
    facade(-2.35, 2.8, 1.75, .12, 1.55, 2),
    facade(-3.58, .6, 4.26, 2.42, .62, 5),
    facade(2.27, 2.3, 1.66, .54, .63, 3),
  ],
  'deca-center': [
    facade(-1.6, 2.1, 3.05, .23, 1.35, 4),
    facade(-.7, 1.65, 4.17, 2.39, .62, 5),
    facade(-3.42, .35, 4.34, 4.25, .67, 5),
  ],
  'fll-center': [
    facade(-4.05, 2.65, 4.95, .65, .74, 5),
    facade(2.04, -.3, 1.56, .05, 1.25, 3),
  ],
}

export const FACADES = Object.fromEntries(Object.entries(fenestration).map(([id, bands]) => [
  id,
  {
    glass: combine(bands.flatMap(band => band.glass)),
    trim: combine(bands.flatMap(band => band.trim)),
  },
])) as Record<ResumeEntryId, { glass: BufferGeometry; trim: BufferGeometry }>
