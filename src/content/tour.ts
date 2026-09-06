import { ATTRACTIONS } from './attractions'
import type { Attraction } from '../types/attraction'

// PRD v4 §5 — every stop is now in this list, including "More Coming Soon"
// (excluded pre-v4 as "nothing to narrate there yet") — Next/Prev and the
// explore-yourself scrub (§7.5) are now the *primary* way through the city,
// so a stop missing from here would only be reachable via a direct deep
// link or AccessibleNav.
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
  'coming-soon',
]

export const TOUR_ORDER: Attraction[] = TOUR_ID_ORDER.map(
  (id) => ATTRACTIONS.find((a) => a.id === id)!,
)
