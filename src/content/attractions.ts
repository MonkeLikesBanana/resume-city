import type { Attraction } from '../types/attraction'
import { nearestPositionOnArm } from '../lib/roadGraph'

// PRD v2 §5/§8 — Content Map. Single source of truth: every hotspot, panel,
// breadcrumb entry, route, and accessible-nav entry is derived from this
// array. Positions follow the downtown Main Street layout in
// src/content/road.ts — buildings sit off the road centerline (±9 in Z); the
// road itself runs along Z=0, so each building's curb point (nearest point on
// the road) is simply its own X coordinate at Z=0. `height` (meters,
// post-scale) drives the arrival tilt (PRD v2 §7.3) — no more per-building
// camera overrides.

export const ATTRACTIONS: Attraction[] = [
  // ---------------------------------------------------------------------
  // Welcome Plaza — the city's entrance, at the road's center (§4.3)
  // ---------------------------------------------------------------------
  {
    id: 'welcome-plaza',
    district: 'plaza',
    name: 'Welcome Plaza',
    subtitle: 'Aarav Vaswani',
    position: [-6, 0, 4], // near the junction/gate corner — the tilt aims here
    // MUST be explicit: the Plaza's parked position is the far end of its own
    // short spur arm (PRD v3 §7.1), not "nearest point on my own arm to my
    // position" (which would incorrectly resolve to near the junction itself,
    // not out at the open-square vantage point).
    curb: { arm: 'plaza', t: 1 },
    height: 6.5, // the welcome arch (PRD v2 §4.3): 2 columns + beam + cap
    description:
      "Aarav is a driven student interested in robotics, electronics, and business. Throughout his two years in high school, he's been part of the Saints Robotics FRC team, mentored FLL teams, taken the most rigorous academic courseload available to him, and competed in business events. His ultimate goal is to have a positive impact on the world through innovation and entrepreneurship.",
    facts: ['Bellevue, Washington', '(425) 531-2273', 'aarav.vaswani@gmail.com'],
    tags: [],
    accentColor: 'foundry',
  },

  // ---------------------------------------------------------------------
  // The Foundry District — downtown, career (§5.1) — Main Street runs west
  // from the Plaza; buildings alternate sides
  // ---------------------------------------------------------------------
  {
    id: 'robotics-workshop',
    district: 'foundry',
    name: 'Robotics Workshop',
    subtitle: 'Saints Robotics — FRC Team',
    position: [-16, 0, -9],
    scale: 2.1,
    rotationY: 0,
    model: '/assets/models/robotics-workshop.glb',
    height: 11,
    // Explicit override: this kitbash's merged geometry isn't centered on its
    // placement origin — its front wall sits at z≈-4.8, much closer to the
    // road than the -9 position suggests, so the automatic nearest-point curb
    // parked the camera almost flush against it. Parking 5m further down the
    // road gives an angled 3/4 view instead of a flat wall filling the frame.
    curb: nearestPositionOnArm('foundry', [-21, 0, 0]),
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
    position: [-26, 0, 9],
    scale: 3,
    rotationY: Math.PI,
    model: '/assets/models/neemo-hq.glb',
    height: 3.9,
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
    position: [-36, 0, -9],
    scale: 3.4,
    rotationY: 0,
    model: '/assets/models/academic-hall.glb',
    height: 3.7,
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
    position: [-46, 0, 9],
    scale: 3,
    rotationY: Math.PI,
    model: '/assets/models/makers-club.glb',
    height: 2.7,
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
    name: 'FLL Mentorship Center',
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

  // ---------------------------------------------------------------------
  // Lakeside — personal (§5.2) — a residential street running south from
  // the Plaza, perpendicular to Main Street (PRD v3 §4.4/§7.1). Houses
  // alternate sides of the street (±9 in X); EAST/WEST rotate each house to
  // face the street it fronts, same convention as the Foundry filler rows.
  // ---------------------------------------------------------------------
  {
    id: 'cafe',
    district: 'lakeside',
    name: 'The Café',
    subtitle: 'Coffee, sushi, Indian food — and cooking (self-rated: not great at it)',
    position: [-9, 0, 16],
    scale: 3,
    rotationY: -Math.PI / 2, // west-side lot, faces east toward the street
    model: '/assets/models/cafe.glb',
    height: 2.5,
    description: "He runs on coffee, and he's always down for sushi or Indian food. He enjoys cooking too — even if the results are hit or miss.",
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'arcade',
    district: 'lakeside',
    name: 'Arcade / Game Room',
    subtitle: 'Video games — favorite is Minecraft',
    position: [9, 0, 26],
    scale: 3,
    rotationY: Math.PI / 2, // east-side lot, faces west toward the street
    model: '/assets/models/arcade.glb',
    height: 3.4,
    description: "He's been playing video games for as long as he can remember — Minecraft is the all-time favorite.",
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'sports-field',
    district: 'lakeside',
    name: 'Sports Field',
    subtitle: 'Plays a bit of everything, recreationally',
    position: [-9, 0, 38],
    scale: 3,
    rotationY: -Math.PI / 2,
    model: '/assets/models/sports-field.glb',
    height: 3.1,
    description: "He's into pretty much any sport — not amazing at any one of them, but always up for playing.",
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'open-road',
    district: 'lakeside',
    name: 'The Open Road',
    subtitle: 'Driving',
    position: [9, 0, 48],
    scale: 3,
    rotationY: Math.PI / 2,
    model: '/assets/models/open-road.glb',
    height: 3.7,
    description: 'He loves driving — any excuse to be behind the wheel.',
    tags: [],
    accentColor: 'lakeside',
  },
  {
    id: 'coming-soon',
    district: 'lakeside',
    name: 'More Coming Soon',
    subtitle: 'An empty lot',
    position: [-9, 0, 58],
    scale: 2.5,
    height: 2,
    description: "This lot's still under construction — more interests are on the way. See PRD §16 for exactly how a new stop gets built here.",
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
