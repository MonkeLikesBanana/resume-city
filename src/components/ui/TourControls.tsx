import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import { TOUR_ORDER } from '../../content/tour'
import useReducedMotion from '../../hooks/useReducedMotion'

const AUTO_ADVANCE_MS = 7000

/** PRD §3/§13 Phase 7 — "auto-advances through every attraction ... with
 * Next/Prev/Pause controls." Reuses the exact same navigate()-driven
 * drive+tilt path every other click uses (PRD v2 §7.3) — this is just a
 * timer deciding when to call navigate() next. */
export default function TourControls() {
  const tourMode = useCityStore((s) => s.tourMode)
  const setTourMode = useCityStore((s) => s.setTourMode)
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [playing, setPlaying] = useState(true)

  const index = TOUR_ORDER.findIndex((a) => a.id === activeAttractionId)

  const goTo = (i: number) => {
    const stop = TOUR_ORDER[(i + TOUR_ORDER.length) % TOUR_ORDER.length]
    navigate(`/${stop.district}/${stop.id}`)
  }

  const exitTour = () => {
    setTourMode(false)
    navigate('/')
  }

  useEffect(() => {
    if (!tourMode || !playing || index === -1 || reducedMotion) return
    if (index >= TOUR_ORDER.length - 1) {
      const t = setTimeout(() => setPlaying(false), AUTO_ADVANCE_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => goTo(index + 1), AUTO_ADVANCE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourMode, playing, index, reducedMotion])

  if (!tourMode || index === -1) return null

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-ink)] px-3 py-2 text-sm text-[var(--color-ground)] shadow-xl">
      <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous stop" className="rounded-full px-2 py-1 hover:bg-white/10 cursor-pointer">
        ← Prev
      </button>
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause guided tour' : 'Resume guided tour'}
        className="rounded-full bg-[var(--color-foundry)] px-3 py-1 font-medium text-[var(--color-ink)] hover:opacity-90 cursor-pointer"
      >
        {playing ? '⏸ Pause' : '▶ Play'}
      </button>
      <span className="px-1 text-xs text-[var(--color-ground)]/70 tabular-nums">
        {index + 1} / {TOUR_ORDER.length}
      </span>
      <button type="button" onClick={() => goTo(index + 1)} aria-label="Next stop" className="rounded-full px-2 py-1 hover:bg-white/10 cursor-pointer">
        Next →
      </button>
      <span className="mx-1 h-4 w-px bg-white/20" />
      <button type="button" onClick={exitTour} aria-label="Exit guided tour" className="rounded-full px-2 py-1 hover:bg-white/10 cursor-pointer">
        ✕ Exit
      </button>
    </div>
  )
}
