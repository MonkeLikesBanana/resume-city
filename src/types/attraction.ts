export type District = 'foundry' | 'plaza'
export type Vec3 = [number, number, number]

export interface TimelineEntry {
  role: string
  dateRange: string
  description?: string
}

export interface Attraction {
  id: string
  district: District
  name: string
  placeName: string
  subtitle: string
  position: Vec3
  timeline?: TimelineEntry[]
  description?: string
  facts?: string[]
  links?: { label: string; href: string }[]
  tags: string[]
}
