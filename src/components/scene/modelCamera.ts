import { Box3, Quaternion, Vector3 } from 'three'
import type { Attraction } from '../../types/attraction'
import type { ResumeEntryId } from '../../content/resume'
import { SIGNATURES } from './massing'

export const MODEL_FOV = 26
export const MOVE_SECONDS = 2.1

export interface ModelPose {
  position: Vector3
  target: Vector3
}

export function composition(width: number, height: number, panelHeight?: number) {
  if (width >= 900) {
    const panelWidth = width >= 1200 ? 380 : 330
    // Keep the building centered within the left 60%, clear of the résumé.
    const span = Math.min(width * .6, width - panelWidth - 28)
    return { width, height, span, clearHeight: height - 110, offsetX: (width - span) / 2, offsetY: 0 }
  }

  const bottom = panelHeight ?? height * .49
  const top = 62
  return { width, height, span: width, clearHeight: height - top - bottom, offsetX: 0, offsetY: (bottom - top) / 2 }
}

export function stopPose(stop: Attraction, frame: ReturnType<typeof composition>): ModelPose {
  const bounds = new Box3().copy(SIGNATURES[stop.id as ResumeEntryId].boundingBox!)
  bounds.translate(new Vector3(...stop.position))
  const target = bounds.getCenter(new Vector3())
  const overview = stop.district === 'plaza'
  const waterfront = stop.id === 'academic-hall' || stop.id === 'deca-center'
  const direction = new Vector3(overview ? .8 : .52, waterfront ? .62 : .83, 1).normalize()
  const right = new Vector3(direction.z, 0, -direction.x).normalize()
  const up = new Vector3().crossVectors(direction, right)
  const halfHeight = Math.tan(MODEL_FOV * Math.PI / 360) * .72 / frame.height
  const halfVertical = halfHeight * Math.max(30, frame.clearHeight)
  const halfHorizontal = halfHeight * frame.span
  let distance = 0

  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(target)
        const across = Math.abs(corner.dot(right)) / halfHorizontal
        const above = Math.abs(corner.dot(up)) / halfVertical
        distance = Math.max(distance, corner.dot(direction) + Math.max(across, above))
      }
    }
  }

  const position = target.clone().addScaledVector(direction, distance * (overview ? 1.35 : 1.15))
  return { position, target }
}

export function poseBetween(from: ModelPose, to: ModelPose, progress: number): ModelPose {
  const fraction = progress * progress * (3 - 2 * progress)
  const target = from.target.clone().lerp(to.target, fraction)
  const start = from.position.clone().sub(from.target)
  const end = to.position.clone().sub(to.target)
  const length = start.length() + (end.length() - start.length()) * fraction
  const turn = new Quaternion().setFromUnitVectors(start.normalize(), end.normalize())
  const direction = start.applyQuaternion(new Quaternion().slerp(turn, fraction))
  const position = target.clone().addScaledVector(direction, length)
  return { position, target }
}
