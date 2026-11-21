import { CLASS_YEAR, CONTACT, PROFILE_LOCATION, PROFILE_NAME, PROFILE_ROLE, PROFILE_SUMMARY } from './profile'
import type { Attraction } from '../types/attraction'

export type ResumeEntry = Pick<Attraction, 'name' | 'subtitle' | 'description' | 'facts' | 'links' | 'tags' | 'timeline'>

// Role timelines supply the work and dates shown in the guided story.
export const RESUME_ENTRIES = {
  'welcome-plaza': {
    name: PROFILE_NAME,
    subtitle: PROFILE_ROLE,
    description: PROFILE_SUMMARY,
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
          'Co-lead an 80+ member team with a $40,000 annual budget across mechanical, programming, and outreach subteams. Help plan strategy and support team operations for the competition season.',
      },
      {
        role: 'Competition Technician',
        dateRange: '2026–Present',
        description:
          'Diagnose and repair mechanical and electrical failures between matches while allocating team resources under time pressure.',
      },
      {
        role: 'Electrical Control Systems Officer',
        dateRange: '2025–2026',
        description:
          "Designed, wired, and maintained the robot's electrical control systems. Trained and managed 10+ members, working with a co-officer and other subteams.",
      },
    ],
    tags: ['Electronics', 'Leadership', 'Team Management', 'Control Systems'],
  },
  'neemo-hq': {
    name: 'NEEMO',
    subtitle: 'Co-Founder, 2026–Present',
    timeline: [
      {
        role: 'Co-Founder',
        dateRange: '2026–Present',
        description:
          'Co-founded a business developing long-range RFID tracking for parts in robotics workshops. Lead technical product development. Generated $1,000+ in revenue in the first month.',
      },
    ],
    tags: ['Entrepreneurship', 'RFID', 'Hardware', 'Product Development'],
  },
  'academic-hall': {
    name: 'Interlake High School',
    subtitle: CLASS_YEAR ? `IB Diploma Candidate · Class of ${CLASS_YEAR}` : 'IB Diploma Candidate, 2025–Present',
    timeline: [
      {
        role: CLASS_YEAR ? `IB Diploma Candidate · Class of ${CLASS_YEAR}` : 'IB Diploma Candidate',
        dateRange: '2025–Present',
      },
    ],
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
    timeline: [
      {
        role: 'Co-Founder & Officer',
        dateRange: '2025–Present',
        description:
          'Co-founded a school club for 3D design, 3D printing, and creative projects. Recruited about half of its non-officer members.',
      },
    ],
    tags: ['3D Printing', 'CAD', 'Community Building'],
  },
  'deca-center': {
    name: 'DECA',
    subtitle: 'Competitor, 2025–Present',
    timeline: [
      {
        role: 'Competitor',
        dateRange: '2025–Present',
        // TODO(fact): event name and year of the State qualification.
        description: 'Compete in entrepreneurship events. Advanced to the State competition.',
      },
    ],
    tags: ['Business', 'Entrepreneurship', 'Competition'],
  },
  'fll-center': {
    name: 'FIRST LEGO League',
    subtitle: 'Mentor, 2024–2026',
    timeline: [
      {
        role: 'Mentor',
        dateRange: '2024–2026',
        // TODO(fact): confirm the exact name of the "Greece Invitational".
        description:
          'Mentored 15+ students on two FIRST LEGO League teams in core engineering skills and practices. One team advanced to States, the other to the Greece Invitational.',
      },
    ],
    tags: ['Mentorship', 'Volunteering', 'Robotics Outreach'],
  },
} satisfies Record<string, ResumeEntry>

export type ResumeEntryId = keyof typeof RESUME_ENTRIES
