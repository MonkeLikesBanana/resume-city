import type { Vec3, Arm } from '../types/attraction'

// Treat the Plaza as a road arm so home trips use the same junction logic as every other drive.

export const FOUNDRY_ARM: Vec3[] = [
  [0, 0, 0], [-8, 0, 0], [-16, 0, 0], [-26, 0, 0], [-36, 0, 0],
  [-46, 0, 0], [-58, 0, 0], [-66, 0, 0], [-76, 0, 0], [-90, 0, 0],
]

export const LAKESIDE_ARM: Vec3[] = [
  [0, 0, 0], [0, 0, 8], [0, 0, 16], [0, 0, 26], [0, 0, 36],
  [0, 0, 46], [0, 0, 58], [0, 0, 66], [0, 0, 76], [0, 0, 90],
]

// The home camera parks at the far end of this spur within the Plaza square.
export const PLAZA_ARM: Vec3[] = [
  [0, 0, 0], [7, 0, -7], [14, 0, -14],
]

export const ARMS: Record<Arm, Vec3[]> = {
  foundry: FOUNDRY_ARM,
  lakeside: LAKESIDE_ARM,
  plaza: PLAZA_ARM,
}
