import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import { TOUR_ORDER } from '../../content/tour'
import { TOUR_STOP_U, nearestTourIndex } from '../../lib/tourCurve'
import { scrubState } from '../../lib/scrubState'

/** PRD v6.0 §3 — the explore-yourself scrub (§7.5, holding ←/→) had no
 * visual feedback at all: no sense of where you are along the tour, no way
 * to jump straight to a stop without first driving/scrubbing there. This
 * bar fills both gaps at once, but only while actually scrubbing —
 * TourBar.tsx already covers the parked state (and explicitly renders
 * nothing during a scrub, §9's "transient" comment there), so the two are
 * mutually exclusive by construction, never fighting for the same slot.
 *
 * The thumb position updates via a plain requestAnimationFrame loop
 * reading scrubState.currentU, not React state — that value changes every
 * R3F frame, and useFrame isn't available outside the Canvas, but the
 * underlying "don't push a 60fps value through re-renders" reasoning is
 * the same as dayNightState/windowGlow's registries. Dragging the track
 * writes scrubState.requestedU, which CameraRig picks up and drives the
 * camera to every frame (same visual treatment as holding an arrow key);
 * releasing settles onto the nearest stop by calling navigate() directly,
 * reusing the exact same drive machinery Prev/Next/AccessibleNav already
 * trigger. Clicking a stop's own tick mark does that navigate() straight
 * away, skipping the drag entirely — the "click an attraction to jump to
 * its panel" half of the ask. */
export default function ExploreScrubBar() {
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    let raf: number
    const tick = () => {
      if (thumbRef.current) thumbRef.current.style.left = `${scrubState.currentU * 100}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const uFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return scrubState.currentU
    const rect = track.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    scrubState.requestedU = uFromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    scrubState.requestedU = uFromClientX(e.clientX)
  }
  const endDrag = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    scrubState.requestedU = null
    const nearest = TOUR_ORDER[nearestTourIndex(scrubState.currentU)]
    navigate(`/${nearest.district}/${nearest.id}`)
  }

  if (activeAttractionId !== null) return null // transient: only while actively scrubbing — see TourBar.tsx's mirror-image gate

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-20 w-[min(90vw,640px)] -translate-x-1/2 rounded-2xl bg-[var(--color-ink)] px-5 py-4 shadow-xl">
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative h-1.5 cursor-pointer touch-none rounded-full bg-white/20"
      >
        {TOUR_ORDER.map((stop, i) => (
          <button
            key={stop.id}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => navigate(`/${stop.district}/${stop.id}`)}
            aria-label={`Jump to ${stop.name}`}
            title={stop.name}
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-[var(--color-ink)] bg-white/60 hover:bg-white"
            style={{ left: `${TOUR_STOP_U[i] * 100}%` }}
          />
        ))}
        <div
          ref={thumbRef}
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-foundry)] shadow"
          style={{ left: '0%' }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-[var(--color-ground)]/70">Drag to explore, or click a stop to jump there</p>
    </div>
  )
}
