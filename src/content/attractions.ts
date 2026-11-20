import type { Attraction, District, Vec3 } from '../types/attraction'
import { RESUME_ENTRIES, type ResumeEntryId } from './resume'

interface Placement {
  id: ResumeEntryId
  district: District
  placeName: string
  position: Vec3
}

const placements: Placement[] = [
  { id: 'welcome-plaza', district: 'plaza', placeName: 'Welcome Plaza', position: [13, 0, 6] },
  { id: 'robotics-workshop', district: 'foundry', placeName: 'Robotics Workshop', position: [0, 0, -7] },
  { id: 'neemo-hq', district: 'foundry', placeName: 'NEEMO HQ', position: [-13, 0, 7] },
  { id: 'academic-hall', district: 'foundry', placeName: 'Academic Hall', position: [-26, 0, -8] },
  { id: 'makers-club', district: 'foundry', placeName: 'Makers Club Workshop', position: [-39, 0, 7] },
  { id: 'deca-center', district: 'foundry', placeName: 'DECA Business Center', position: [-52, 0, -7] },
  { id: 'fll-center', district: 'foundry', placeName: 'FLL Mentorship Center', position: [-65, 0, 7] },
]

export const ATTRACTIONS: Attraction[] = placements.map((placement) => ({
  ...placement,
  ...RESUME_ENTRIES[placement.id],
}))

export function getAttraction(id: string): Attraction | undefined {
  return ATTRACTIONS.find((attraction) => attraction.id === id)
}
