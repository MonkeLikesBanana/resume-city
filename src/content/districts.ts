import { DISTRICT_NAMES } from '../config'
import type { District } from '../types/attraction'

export interface DistrictMeta {
  id: District
  name: string
}

export const DISTRICTS: Record<District, DistrictMeta> = {
  foundry: {
    id: 'foundry',
    name: DISTRICT_NAMES.foundry,
  },
  lakeside: {
    id: 'lakeside',
    name: DISTRICT_NAMES.lakeside,
  },
  plaza: {
    id: 'plaza',
    name: DISTRICT_NAMES.plaza,
  },
}
