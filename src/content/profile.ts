export const PROFILE_NAME = 'Aarav Vaswani'

/** Graduation year. Leave null until confirmed; the page shows "Class of {year}" only when set.
 * TODO(fact): graduation year. */
export const CLASS_YEAR: number | null = null

const CLASS_LABEL = CLASS_YEAR ? ` · Class of ${CLASS_YEAR}` : ''

export const PROFILE_ROLE = `Saints Robotics Vice President · NEEMO Co-Founder · IB Diploma Candidate${CLASS_LABEL}`

export const PROFILE_SUMMARY =
  'Aarav is pursuing the IB Diploma at Interlake High School with a 4.0 GPA. He helps lead an 80+ member robotics team and co-founded NEEMO to develop RFID tracking for parts in robotics workshops.'

export const PROFILE_LOCATION = 'Bellevue, Washington'
export const SITE_URL_LABEL = 'resume-city.vercel.app'

export const INTERESTS = 'Cooking, recreational sports, driving, and video games.'

export const CONTACT = [
  { label: 'aarav.vaswani@gmail.com', href: 'mailto:aarav.vaswani@gmail.com' },
  { label: '(425) 531-2273', href: 'tel:+14255312273' },
]

// Wording follows the Skills section of the PDF résumé.
export const PROFILE_SKILLS = [
  'Circuit design and assembly',
  'Robot electrical systems',
  'CAD (Onshape)',
  '3D printing and prototyping',
  'Large-scale additive manufacturing',
]
