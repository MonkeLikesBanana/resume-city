import { DISTRICT_NAMES } from '../config'
import type { District } from '../types/attraction'

export interface DistrictMeta {
  id: District
  name: string
  accent: 'foundry' | 'lakeside' | 'plaza'
  blurb: string
}

export const DISTRICTS: Record<District, DistrictMeta> = {
  foundry: {
    id: 'foundry',
    name: DISTRICT_NAMES.foundry,
    accent: 'foundry',
    blurb: 'Career and achievements — robotics, the startup, school, and clubs.',
  },
  lakeside: {
    id: 'lakeside',
    name: DISTRICT_NAMES.lakeside,
    accent: 'lakeside',
    blurb: 'Personal interests and the person behind the résumé.',
  },
  plaza: {
    id: 'plaza',
    name: DISTRICT_NAMES.plaza,
    accent: 'plaza',
    blurb: "Aarav's introduction and contact info — the hub between the two districts.",
  },
}
