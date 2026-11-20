import type { Attraction } from '../types/attraction'
import { nearestPositionOnArm } from '../lib/roadGraph'
import { RESUME_ENTRIES, type ResumeEntry, type ResumeEntryId } from './resume'

const placements: (Omit<Attraction, keyof ResumeEntry | 'id'> & { id: ResumeEntryId })[] = [
  {
    id: 'welcome-plaza',
    district: 'plaza',
    placeName: 'Welcome Plaza',
    position: [-6, 0, 4], // near the junction/gate corner — the tilt aims here
    // Park at the end of the Plaza spur to keep both districts in view.
    curb: { arm: 'plaza', t: 1 },
    height: 6.5, // The camera frames the welcome arch.
    accentColor: 'foundry',
  },
  {
    id: 'robotics-workshop',
    district: 'foundry',
    placeName: 'Robotics Workshop',
    position: [-16, 0, -9],
    scale: 2.1,
    rotationY: Math.PI * (155 / 180),
    model: '/assets/models/robotics-workshop.glb',
    height: 11,
    // Angle the garage toward Main Street and park west of the lot to see its doorway and side windows.
    curb: nearestPositionOnArm('foundry', [-25.5, 0, 0]),
    accentColor: 'foundry',
  },
  {
    id: 'neemo-hq',
    district: 'foundry',
    placeName: 'NEEMO HQ',
    // Use the dry strip between the river and the cross street.
    position: [-30.5, 0, 23],
    scale: 3,
    rotationY: Math.PI * (214 / 180),
    model: '/assets/models/neemo-hq.glb',
    height: 3.9,
    curb: nearestPositionOnArm('foundry', [-32, 0, 0]),
    parkingInset: 1.5,
    accentColor: 'foundry',
  },
  {
    id: 'academic-hall',
    district: 'foundry',
    placeName: 'Interlake High School — Academic Hall',
    position: [-36, 0, -9],
    // Face the low-rise model's windowed entrance toward Main Street.
    scale: 2.75,
    rotationY: Math.PI,
    model: '/assets/models/filler/building-e.glb',
    height: 2.46,
    curb: nearestPositionOnArm('foundry', [-43, 0, 0]),
    accentColor: 'foundry',
  },
  {
    id: 'makers-club',
    district: 'foundry',
    placeName: 'Makers Club Workshop (3D Printing)',
    // Leave the cross street open and show the side of the workshop on arrival.
    position: [-51.5, 0, 9],
    scale: 3,
    rotationY: Math.PI * (185 / 180),
    model: '/assets/models/makers-club.glb',
    height: 2.7,
    curb: nearestPositionOnArm('foundry', [-45, 0, 0]),
    accentColor: 'foundry',
  },
  {
    id: 'deca-center',
    district: 'foundry',
    placeName: 'DECA Business Center',
    position: [-58, 0, -9],
    scale: 3,
    rotationY: 0,
    model: '/assets/models/deca-center.glb',
    height: 13.4,
    accentColor: 'foundry',
  },
  {
    id: 'fll-center',
    district: 'foundry',
    placeName: 'FLL Mentorship Center',
    position: [-66, 0, 9],
    scale: 3,
    rotationY: Math.PI,
    model: '/assets/models/fll-center.glb',
    height: 3.9,
    accentColor: 'foundry',
  },
]

export const ATTRACTIONS: Attraction[] = placements.map((placement) => ({
  ...placement,
  ...RESUME_ENTRIES[placement.id],
}))

export function getAttraction(id: string): Attraction | undefined {
  return ATTRACTIONS.find((attraction) => attraction.id === id)
}
