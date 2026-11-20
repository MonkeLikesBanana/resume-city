import { ATTRACTIONS } from './attractions'
import type { Attraction } from '../types/attraction'

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
