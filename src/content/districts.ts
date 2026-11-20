import { DISTRICT_NAMES } from '../config'
import type { District } from '../types/attraction'

export interface DistrictMeta {
  id: District
  name: string
}

export const DISTRICTS: Record<District, DistrictMeta> = {
  plaza: {
    id: 'plaza',
    name: DISTRICT_NAMES.plaza,
  },
  foundry: {
    id: 'foundry',
    name: DISTRICT_NAMES.foundry,
  },
}
