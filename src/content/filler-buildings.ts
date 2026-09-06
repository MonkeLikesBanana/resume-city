import type { FillerBuilding } from '../types/attraction'

// PRD v2 §4.1/§8/§16b — purely decorative downtown density for the Foundry
// District. No resume content, no hotspot, no route entry, never appears in
// AccessibleNav (PRD §10). Two "back rows" flank the six real attractions
// (which sit at z=±9) at z=±16 and z=±23, filling out Main Street's blocks —
// all sourced from City Kit Commercial models already downloaded for v1 but
// unused there.

const NORTH = Math.PI // faces south, toward the street
const SOUTH = 0 // faces north, toward the street

export const FILLER_BUILDINGS: FillerBuilding[] = [
  // --- z=+16 row (behind the north-side attractions) ---
  { model: '/assets/models/filler/building-a.glb', position: [-14, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-f.glb', position: [-22, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-h.glb', position: [-30, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-j.glb', position: [-38, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-l.glb', position: [-50, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-n.glb', position: [-62, 0, 16], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/building-skyscraper-c.glb', position: [-70, 0, 16], rotationY: NORTH, scale: 3 },

  // --- z=-16 row (behind the south-side attractions) ---
  { model: '/assets/models/filler/building-e.glb', position: [-14, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-g.glb', position: [-22, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-i.glb', position: [-30, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-k.glb', position: [-38, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-m.glb', position: [-50, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-skyscraper-a.glb', position: [-62, 0, -16], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/building-skyscraper-d.glb', position: [-70, 0, -16], rotationY: SOUTH, scale: 3 },

  // --- z=+23 / z=-23 rows (third row back, cross-street blocks) ---
  { model: '/assets/models/filler/building-skyscraper-e.glb', position: [-42, 0, 23], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-a.glb', position: [-18, 0, 23], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-c.glb', position: [-34, 0, 23], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-e.glb', position: [-58, 0, 23], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-wide-b.glb', position: [-70, 0, 23], rotationY: NORTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-b.glb', position: [-18, 0, -23], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-d.glb', position: [-34, 0, -23], rotationY: SOUTH, scale: 3 },
  { model: '/assets/models/filler/low-detail-building-f.glb', position: [-58, 0, -23], rotationY: SOUTH, scale: 3 },
]
