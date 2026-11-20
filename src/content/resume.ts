import { CONTACT, PROFILE_LOCATION, PROFILE_NAME, PROFILE_ROLE } from './profile'
import type { Attraction } from '../types/attraction'

export type ResumeEntry = Pick<Attraction, 'name' | 'subtitle' | 'description' | 'facts' | 'links' | 'tags' | 'timeline'>

export const RESUME_ENTRIES = {
  'welcome-plaza': {
    name: PROFILE_NAME,
    subtitle: PROFILE_ROLE,
    description:
      'I am pursuing the IB Diploma at Interlake High School and have a 4.0 GPA. As vice president of Saints Robotics I help lead a team of 80+ members with a $40,000 annual budget, and I co-founded NEEMO to develop RFID tracking for robotics workshops.',
    facts: [PROFILE_LOCATION],
    links: CONTACT,
    tags: [],
  },
  'robotics-workshop': {
    name: 'Saints Robotics (FRC)',
    subtitle: 'Vice President',
    timeline: [
      {
        role: 'Vice President',
        dateRange: '2026–Present',
        description:
          'Co-leading and managing an 80+ member team with a $40,000 annual budget across mechanical, programming, and outreach sub-teams. Supporting strategic planning and team operations for the current competition season.',
      },
      {
        role: 'Technician — Competition',
        dateRange: '2026–Present',
        description:
          'Quick thinking and decision-making to fix the robot between matches — both mechanical and electrical — while managing team resources in real time.',
      },
      {
        role: 'Control Systems Officer — Electrical',
        dateRange: '2025–2026',
        description:
          "Responsible for the design, wiring, and maintenance of the robot's electrical control systems. Taught and managed 10+ members, working with one co-officer and other sub-teams.",
      },
    ],
    tags: ['Electronics', 'Leadership', 'Team Management', 'Control Systems'],
  },
  'neemo-hq': {
    name: 'NEEMO',
    subtitle: 'Co-Founder, 2026–Present',
    description:
      'Co-founded a business focused on long-range RFID tracking of parts within robotics workshops. Generated $1,000+ in revenue in the first month. In charge of product technical development.',
    tags: ['Entrepreneurship', 'RFID', 'Hardware', 'Product Development'],
  },
  'academic-hall': {
    name: 'Interlake High School',
    subtitle: 'IB Diploma Candidate, 2025–Present',
    facts: [
      'GPA 4.0 / 4.0',
      'AP Exams: World History (5), Calculus AB (5), Physics C: Mechanics (5), United States History (5)',
      'IB Higher Level: Physics, Business Management, Analysis & Approaches',
    ],
    tags: ['Academics', 'IB Diploma'],
  },
  'makers-club': {
    name: 'Makers Club',
    subtitle: 'Co-Founder & Officer, 2025–Present',
    description:
      "Co-founded a school club building a community around 3D design, 3D printing, and creative projects. Brought in roughly 50% of the club's non-officer membership.",
    tags: ['3D Printing', 'CAD', 'Community Building'],
  },
  'deca-center': {
    name: 'DECA',
    subtitle: 'Competitor, 2025–Present',
    description: 'Competes in entrepreneurship-focused business events; advanced to the State competition.',
    tags: ['Business', 'Entrepreneurship', 'Competition'],
  },
  'fll-center': {
    name: 'FIRST LEGO League',
    subtitle: 'Mentor, 2024–2026',
    description:
      'Mentored 15+ younger students across two FIRST LEGO League teams, teaching fundamental engineering skills and practices. One team advanced to States, the other to the Greece Invitational.',
    tags: ['Mentorship', 'Volunteering', 'Robotics Outreach'],
  },
} satisfies Record<string, ResumeEntry>

export type ResumeEntryId = keyof typeof RESUME_ENTRIES

export const EXPERIENCE_IDS = ['robotics-workshop', 'neemo-hq', 'makers-club', 'deca-center', 'fll-center'] as const satisfies readonly ResumeEntryId[]
export const EDUCATION_ID = 'academic-hall' satisfies ResumeEntryId
