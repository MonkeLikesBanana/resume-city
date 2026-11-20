import { CONTACT, PROFILE_NAME, PROFILE_ROLE } from './profile'
import type { Attraction } from '../types/attraction'
import { nearestPositionOnArm } from '../lib/roadGraph'

// The scene, tour, routes, and text résumé share these entries.

export const ATTRACTIONS: Attraction[] = [
  // ---------------------------------------------------------------------
  // Welcome Plaza
  // ---------------------------------------------------------------------
  {
    id: 'welcome-plaza',
    district: 'plaza',
    name: PROFILE_NAME,
    placeName: 'Welcome Plaza',
    subtitle: PROFILE_ROLE,
    position: [-6, 0, 4], // near the junction/gate corner — the tilt aims here
    // Park at the end of the Plaza spur to keep both districts in view.
    curb: { arm: 'plaza', t: 1 },
    height: 6.5, // The camera frames the welcome arch.
    description:
      'I am pursuing the IB Diploma at Interlake High School and have a 4.0 GPA. As vice president of Saints Robotics I help lead a team of 80+ members with a $40,000 annual budget, and I co-founded NEEMO to develop RFID tracking for robotics workshops.',
    facts: ['Bellevue, Washington'],
    links: CONTACT,
    tags: [],
    accentColor: 'foundry',
  },

  // ---------------------------------------------------------------------
  // Foundry buildings alternate sides of Main Street.
  // ---------------------------------------------------------------------
  {
    id: 'robotics-workshop',
    district: 'foundry',
    name: 'Saints Robotics (FRC)',
    placeName: 'Robotics Workshop',
    subtitle: 'Vice President',
    position: [-16, 0, -9],
    scale: 2.1,
    rotationY: Math.PI * (155 / 180),
    model: '/assets/models/robotics-workshop.glb',
    height: 11,
    // Angle the garage toward Main Street and park west of the lot to see its doorway and side windows.
    curb: nearestPositionOnArm('foundry', [-25.5, 0, 0]),
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
    accentColor: 'foundry',
  },
  {
    id: 'neemo-hq',
    district: 'foundry',
    name: 'NEEMO',
    placeName: 'NEEMO HQ',
    subtitle: 'Co-Founder, 2026–Present',
    // Use the dry strip between the river and the cross street.
    position: [-30.5, 0, 23],
    scale: 3,
    rotationY: Math.PI * (214 / 180),
    model: '/assets/models/neemo-hq.glb',
    height: 3.9,
    curb: nearestPositionOnArm('foundry', [-32, 0, 0]),
    parkingInset: 1.5,
    description:
      'Co-founded a business focused on long-range RFID tracking of parts within robotics workshops. Generated $1,000+ in revenue in the first month. In charge of product technical development.',
    tags: ['Entrepreneurship', 'RFID', 'Hardware', 'Product Development'],
    accentColor: 'foundry',
  },
  {
    id: 'academic-hall',
    district: 'foundry',
    name: 'Interlake High School',
    placeName: 'Interlake High School — Academic Hall',
    subtitle: 'IB Diploma Candidate, 2025–Present',
    position: [-36, 0, -9],
    // Face the low-rise model's windowed entrance toward Main Street.
    scale: 2.75,
    rotationY: Math.PI,
    model: '/assets/models/filler/building-e.glb',
    height: 2.46,
    curb: nearestPositionOnArm('foundry', [-43, 0, 0]),
    facts: [
      'GPA 4.0 / 4.0',
      'AP Exams: World History (5), Calculus AB (5), Physics C: Mechanics (5), United States History (5)',
      'IB Higher Level: Physics, Business Management, Analysis & Approaches',
    ],
    tags: ['Academics', 'IB Diploma'],
    accentColor: 'foundry',
  },
  {
    id: 'makers-club',
    district: 'foundry',
    name: 'Makers Club',
    placeName: 'Makers Club Workshop (3D Printing)',
    subtitle: 'Co-Founder & Officer, 2025–Present',
    // Leave the cross street open and show the side of the workshop on arrival.
    position: [-51.5, 0, 9],
    scale: 3,
    rotationY: Math.PI * (185 / 180),
    model: '/assets/models/makers-club.glb',
    height: 2.7,
    curb: nearestPositionOnArm('foundry', [-45, 0, 0]),
    description:
      "Co-founded a school club building a community around 3D design, 3D printing, and creative projects. Brought in roughly 50% of the club's non-officer membership.",
    tags: ['3D Printing', 'CAD', 'Community Building'],
    accentColor: 'foundry',
  },
  {
    id: 'deca-center',
    district: 'foundry',
    name: 'DECA',
    placeName: 'DECA Business Center',
    subtitle: 'Competitor, 2025–Present',
    position: [-58, 0, -9],
    scale: 3,
    rotationY: 0,
    model: '/assets/models/deca-center.glb',
    height: 13.4,
    description: 'Competes in entrepreneurship-focused business events; advanced to the State competition.',
    tags: ['Business', 'Entrepreneurship', 'Competition'],
    accentColor: 'foundry',
  },
  {
    id: 'fll-center',
    district: 'foundry',
    name: 'FIRST LEGO League',
    placeName: 'FLL Mentorship Center',
    subtitle: 'Mentor, 2024–2026',
    position: [-66, 0, 9],
    scale: 3,
    rotationY: Math.PI,
    model: '/assets/models/fll-center.glb',
    height: 3.9,
    description:
      'Mentored 15+ younger students across two FIRST LEGO League teams, teaching fundamental engineering skills and practices. One team advanced to States, the other to the Greece Invitational.',
    tags: ['Mentorship', 'Volunteering', 'Robotics Outreach'],
    accentColor: 'foundry',
  },

  // Lakeside houses face the street from alternating sides.
  {
    id: 'cafe',
    district: 'lakeside',
    name: 'The Café',
    subtitle: '',
    position: [-9, 0, 16],
    scale: 3,
    rotationY: -Math.PI / 2, // west-side lot, faces east toward the street
    model: '/assets/models/cafe.glb',
    height: 2.5,
    curb: nearestPositionOnArm('lakeside', [0, 0, 21]),
    description: 'Coffee, sushi, Indian food, and cooking.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'arcade',
    district: 'lakeside',
    name: 'Arcade / Game Room',
    subtitle: '',
    position: [9, 0, 26],
    scale: 3,
    rotationY: Math.PI / 2, // east-side lot, faces west toward the street
    model: '/assets/models/arcade.glb',
    height: 3.4,
    description: 'Video games, especially Minecraft.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'sports-field',
    district: 'lakeside',
    name: 'Sports Field',
    subtitle: '',
    position: [-9, 0, 38],
    scale: 3,
    rotationY: -Math.PI / 2,
    model: '/assets/models/sports-field.glb',
    height: 3.1,
    description: 'Plays a variety of sports recreationally.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'open-road',
    district: 'lakeside',
    name: 'The Open Road',
    subtitle: '',
    position: [9, 0, 48],
    scale: 3,
    rotationY: Math.PI / 2,
    model: '/assets/models/open-road.glb',
    height: 3.7,
    description: 'Enjoys driving.',
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
