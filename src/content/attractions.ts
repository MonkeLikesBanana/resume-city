import type { Attraction } from '../types/attraction'

// PRD §5 — Content Map. Single source of truth: every hotspot, panel,
// breadcrumb entry, route, and accessible-nav entry (§8, §9) is derived from
// this array. Copy is final, taken verbatim from the source resume — see
// PRD.md §5 for the annotated version. Positions/scale/cameraShot are the
// only implementation-detail fields not dictated by the PRD; see §16 for the
// runbook these follow.

export const ATTRACTIONS: Attraction[] = [
  // ---------------------------------------------------------------------
  // Welcome Plaza — hub, not inside either district (§5.0)
  // ---------------------------------------------------------------------
  {
    id: 'welcome-plaza',
    district: 'plaza',
    name: 'Welcome Plaza',
    subtitle: 'Aarav Vaswani',
    position: [0, 0, 0],
    cameraShot: {
      cameraPosition: [0, 9, 20],
      cameraTarget: [0, 2, 0],
    },
    description:
      "I am a driven student interested in robotics, electronics, and business. Throughout the 2 years I've been in high school, I've been part of the Saints Robotics FRC team, mentored FLL teams, taken the most rigorous academic courseload available to me, and competed in business events. My ultimate goal is to have a positive impact on the world through innovation and entrepreneurship.",
    facts: ['Bellevue, Washington', '(425) 531-2273', 'aarav.vaswani@gmail.com'],
    tags: [],
    accentColor: 'foundry',
  },

  // ---------------------------------------------------------------------
  // The Foundry District — career (§5.1)
  // ---------------------------------------------------------------------
  {
    id: 'robotics-workshop',
    district: 'foundry',
    name: 'Robotics Workshop',
    subtitle: 'Saints Robotics — FRC Team',
    position: [-16, 0, -4],
    scale: 2.1,
    model: '/assets/models/robotics-workshop.glb',
    footprint: 10,
    timeline: [
      {
        role: 'Vice President',
        dateRange: '2026–Present',
        description:
          'Co-leading and managing an 80+ member team with a $40,000 annual budget across mechanical, programming, and outreach sub-teams. Supporting strategic planning and team operations for the current competition season.',
      },
      {
        role: 'Control Systems Officer — Electrical',
        dateRange: '2025–2026',
        description:
          "Responsible for the design, wiring, and maintenance of the robot's electrical control systems. Taught and managed 10+ members, working with one co-officer and other sub-teams.",
      },
      {
        role: 'Technician – Competition',
        dateRange: '2026–Present',
        description:
          'Quick thinking and decision-making to fix the robot between matches — both mechanical and electrical — while managing team resources in real time.',
      },
    ],
    tags: ['Electronics', 'Leadership', 'Team Management', 'Control Systems', 'Budget ($40k)'],
    accentColor: 'foundry',
  },
  {
    id: 'neemo-hq',
    district: 'foundry',
    name: 'NEEMO HQ',
    subtitle: 'Co-Founder',
    position: [-27, 0, -11],
    scale: 3,
    rotationY: Math.PI * 0.75,
    model: '/assets/models/neemo-hq.glb',
    footprint: 4,
    description:
      'Co-founded a business focused on long-range RFID tracking of parts within robotics workshops. Generated $1,000+ in revenue in the first month. In charge of product technical development.',
    tags: ['Entrepreneurship', 'RFID', 'Hardware', 'Product Development'],
    accentColor: 'foundry',
  },
  {
    id: 'academic-hall',
    district: 'foundry',
    name: 'Interlake High School — Academic Hall',
    subtitle: 'IB Diploma Candidate, 2025–Present',
    position: [-27, 0, 6],
    scale: 3.4,
    model: '/assets/models/academic-hall.glb',
    footprint: 5,
    facts: [
      'GPA 4.0 / 4.0',
      'AP Exams: World History (5), Calculus AB (5), Physics C: Mechanics (5), United States History (5)',
      'IB Higher Level: Physics, Business Management, Analysis & Approaches',
    ],
    tags: ['Academics', 'IB Diploma', '4.0 GPA'],
    accentColor: 'foundry',
  },
  {
    id: 'makers-club',
    district: 'foundry',
    name: 'Makers Club Workshop (3D Printing)',
    subtitle: 'Co-Founder & Officer, 2025–Present',
    position: [-16, 0, 15],
    scale: 3,
    rotationY: -Math.PI * 0.6,
    model: '/assets/models/makers-club.glb',
    footprint: 4,
    description:
      "Co-founded a school club building a community around 3D design, 3D printing, and creative projects. Brought in roughly 50% of the club's non-officer membership.",
    tags: ['3D Printing', 'CAD', 'Community Building'],
    accentColor: 'foundry',
  },
  {
    id: 'deca-center',
    district: 'foundry',
    name: 'DECA Business Center',
    subtitle: 'Competitor, 2025–Present',
    position: [-40, 0, -14],
    scale: 3,
    model: '/assets/models/deca-center.glb',
    footprint: 9,
    // computeDefaultShot's distance formula is footprint-driven and doesn't
    // account for height — this model is a genuine 13m-tall thin tower on a
    // ~4m footprint (§7.3 explicitly allows hand art-direction for exactly
    // this case rather than fighting the generic formula).
    cameraShot: {
      cameraPosition: [-24, 14, 6],
      cameraTarget: [-40, 6, -14],
    },
    description: 'Competes in entrepreneurship-focused business events; advanced to the State competition.',
    tags: ['Business', 'Entrepreneurship', 'Competition'],
    accentColor: 'foundry',
  },
  {
    id: 'fll-center',
    district: 'foundry',
    name: 'FLL Mentorship Center',
    subtitle: 'Mentor, 2024–2026',
    position: [-34, 0, 13],
    scale: 3,
    rotationY: -Math.PI * 0.4,
    model: '/assets/models/fll-center.glb',
    footprint: 4,
    description:
      'Mentored 15+ younger students across two FIRST LEGO League teams, teaching fundamental engineering skills and practices. One team advanced to States, the other to the Greece Invitational.',
    tags: ['Mentorship', 'Volunteering', 'Robotics Outreach'],
    accentColor: 'foundry',
  },

  // ---------------------------------------------------------------------
  // Lakeside — personal (§5.2)
  // ---------------------------------------------------------------------
  {
    id: 'cafe',
    district: 'lakeside',
    name: 'The Café',
    subtitle: 'Coffee, sushi, Indian food — and cooking (self-rated: not great at it)',
    position: [16, 0, -8],
    scale: 3,
    rotationY: Math.PI,
    model: '/assets/models/cafe.glb',
    footprint: 4,
    description:
      'Runs on coffee. Always down for sushi or Indian food, and enjoys cooking — even if the results are hit or miss.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'arcade',
    district: 'lakeside',
    name: 'Arcade / Game Room',
    subtitle: 'Video games — favorite is Minecraft',
    position: [27, 0, -3],
    scale: 3,
    rotationY: Math.PI * 1.2,
    model: '/assets/models/arcade.glb',
    footprint: 4,
    description: 'Been playing video games for as long as I can remember — Minecraft is the all-time favorite.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'sports-field',
    district: 'lakeside',
    name: 'Sports Field',
    subtitle: 'Plays a bit of everything, recreationally',
    position: [27, 0, 11],
    scale: 3,
    rotationY: -Math.PI * 0.8,
    model: '/assets/models/sports-field.glb',
    footprint: 4,
    description: 'Into pretty much any sport — not amazing at any one of them, but always up for playing.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'open-road',
    district: 'lakeside',
    name: 'The Open Road',
    subtitle: 'Driving',
    position: [16, 0, 17],
    scale: 3,
    rotationY: Math.PI * 0.9,
    model: '/assets/models/open-road.glb',
    footprint: 4,
    description: 'Loves driving — any excuse to be behind the wheel.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'coming-soon',
    district: 'lakeside',
    name: 'More Coming Soon',
    subtitle: 'An empty lot',
    position: [33, 0, 4],
    scale: 2.5,
    footprint: 3,
    description:
      "This lot's still under construction — more interests are on the way. See PRD §16 for exactly how a new stop gets built here.",
    tags: [],
    accentColor: 'lakeside',
  },
]

export function getAttraction(id: string): Attraction | undefined {
  return ATTRACTIONS.find((a) => a.id === id)
}

export function attractionsByDistrict(district: Attraction['district']): Attraction[] {
  return ATTRACTIONS.filter((a) => a.district === district)
}
