import { MAX_SPEED, ACCEL } from '../config'

const MIN_DURATION = 0.35 // seconds — floor for a near-zero-distance hop

/** PRD v4 §7.2 — a real trapezoidal (accelerate/cruise/decelerate) velocity
 * profile, replacing v3's single easeInOutCubic over the whole trip. That
 * eased curve *looked* smooth on paper, but at v3's speed most trips (many
 * stops are 8-20 units apart) completed in well under a second — too fast
 * for the eye to read as anything but a snap, regardless of how smooth the
 * underlying math was. Slower overall, and shaped like an actual car: ramp
 * up, hold a cruising speed, ramp down — not an instant snap to a cruise
 * that's over before it's perceived.
 *
 * If the trip is too short to ever reach MAX_SPEED, it's a triangle profile
 * instead (accelerate to a lower peak, then immediately decelerate) rather
 * than a trapezoid — the standard motion-planning distinction. */
function distanceAtTime(D: number, elapsed: number): number {
  if (D <= 0) return 0
  const dAccelFull = MAX_SPEED ** 2 / (2 * ACCEL)

  if (2 * dAccelFull <= D) {
    const tAccel = MAX_SPEED / ACCEL
    const cruiseDist = D - 2 * dAccelFull
    const tCruise = cruiseDist / MAX_SPEED
    if (elapsed < tAccel) return 0.5 * ACCEL * elapsed ** 2
    if (elapsed < tAccel + tCruise) return dAccelFull + MAX_SPEED * (elapsed - tAccel)
    const tDecel = elapsed - tAccel - tCruise
    return D - 0.5 * ACCEL * Math.max(0, tAccel - tDecel) ** 2
  }

  // Triangle profile: too short to reach MAX_SPEED. Peak speed found by
  // solving 2*(peak²/2·ACCEL) = D.
  const peak = Math.sqrt(D * ACCEL)
  const tPeak = peak / ACCEL
  if (elapsed < tPeak) return 0.5 * ACCEL * elapsed ** 2
  const tDecel = elapsed - tPeak
  return D / 2 + peak * tDecel - 0.5 * ACCEL * tDecel ** 2
}

function totalTripTime(D: number): number {
  if (D <= 0) return MIN_DURATION
  const dAccelFull = MAX_SPEED ** 2 / (2 * ACCEL)
  if (2 * dAccelFull <= D) {
    const tAccel = MAX_SPEED / ACCEL
    const tCruise = (D - 2 * dAccelFull) / MAX_SPEED
    return Math.max(MIN_DURATION, 2 * tAccel + tCruise)
  }
  const peak = Math.sqrt(D * ACCEL)
  return Math.max(MIN_DURATION, (2 * peak) / ACCEL)
}

/** Given a total trip distance and duration, returns 0..1 progress *within
 * this trip* at `elapsed` seconds — clamped, so callers never need to
 * separately guard elapsed > duration. */
export function tripProgress(distance: number, duration: number, elapsed: number): number {
  if (distance <= 0) return 1
  const clampedElapsed = Math.min(elapsed, duration)
  return Math.min(1, distanceAtTime(distance, clampedElapsed) / distance)
}

export { totalTripTime }
