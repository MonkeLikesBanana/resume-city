export const TOUR_CHAPTERS = [
  {
    id: 'education',
    cityStop: 'academic-hall',
    label: 'Education',
    title: 'What I study',
    // TODO(story): Add one verified assignment or class concept that Aarav can connect to a project.
    introduction: 'My higher-level IB courses span physics, mathematics, and business management. Outside class, I work on robot electrical systems and help develop a product for robotics workshops.',
  },
  {
    id: 'building',
    cityStop: 'robotics-workshop',
    label: 'Build',
    title: 'Building and repairing robots',
    // TODO(story): Add one verified robot repair or fabrication problem and what Aarav did to solve it.
    introduction: 'On the Saints Robotics FIRST Robotics Competition team, I’ve wired the robot’s control systems and repaired mechanical and electrical failures between matches. I also co-founded Makers Club at school for projects in 3D design and printing.',
  },
  {
    id: 'community',
    cityStop: 'robotics-workshop',
    label: 'Teams',
    title: 'Leading and teaching',
    // TODO(story): Add one confirmed example of teaching a skill or coordinating the team.
    introduction: 'I trained members of Saints Robotics and taught engineering fundamentals to younger students on two FIRST LEGO League teams. As vice president of Saints Robotics, I now help coordinate work across the mechanical, programming, and outreach subteams.',
  },
  {
    id: 'current-work',
    cityStop: 'neemo-hq',
    label: 'Current',
    title: 'Developing products and competing in business',
    // TODO(story): Add one verified NEEMO prototype decision or a specific DECA event experience.
    introduction: 'I co-founded NEEMO to build a way to track parts in robotics workshops using long-range radio-frequency identification (RFID), and I lead the technical development. I also compete in entrepreneurship events through DECA.',
  },
] as const
