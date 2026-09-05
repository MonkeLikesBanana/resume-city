import { ATTRACTIONS } from './attractions'
import type { Attraction } from '../types/attraction'

// PRD §13 Phase 7 — "Welcome Plaza → Robotics Workshop → NEEMO → Academic
// Hall → Makers Club → DECA → FLL → Café → Arcade → Sports Field → Open
// Road." The "More Coming Soon" placeholder is intentionally excluded —
// there's nothing to narrate there yet.
const TOUR_ID_ORDER = [
  'welcome-plaza',
  'robotics-workshop',
  'neemo-hq',
  'academic-hall',
  'makers-club',
  'deca-center',
  'fll-center',
  'cafe',
  'arcade',
  'sports-field',
  'open-road',
]

export const TOUR_ORDER: Attraction[] = TOUR_ID_ORDER.map(
  (id) => ATTRACTIONS.find((a) => a.id === id)!,
)
