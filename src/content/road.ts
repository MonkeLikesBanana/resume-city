import type { Vec3, Arm } from '../types/attraction'

// PRD v3 §7.1 — three arms meeting at a junction at the world origin:
// Foundry runs west (-X), Lakeside runs south (+Z), and a short Plaza spur
// runs out into the open corner square (+X,-Z) where the car parks at home.
// Modeling the Plaza as its own short arm (rather than a special case) means
// every trip in the app — including "drive home" — is just an ordinary
// same-arm or cross-arm trip through buildTripCurve()'s one mechanism
// (src/lib/roadGraph.ts), no separate code path needed for "home."

export const FOUNDRY_ARM: Vec3[] = [
  [0, 0, 0], [-8, 0, 0], [-16, 0, 0], [-26, 0, 0], [-36, 0, 0],
  [-46, 0, 0], [-58, 0, 0], [-66, 0, 0], [-76, 0, 0], [-90, 0, 0],
]

export const LAKESIDE_ARM: Vec3[] = [
  [0, 0, 0], [0, 0, 8], [0, 0, 16], [0, 0, 26], [0, 0, 36],
  [0, 0, 46], [0, 0, 58], [0, 0, 66], [0, 0, 76], [0, 0, 90],
]

// The home-parked vantage point, at the far end of the spur — see PRD §7.7.
export const PLAZA_ARM: Vec3[] = [
  [0, 0, 0], [11, 0, -11], [22, 0, -22],
]

export const ARMS: Record<Arm, Vec3[]> = {
  foundry: FOUNDRY_ARM,
  lakeside: LAKESIDE_ARM,
  plaza: PLAZA_ARM,
}
