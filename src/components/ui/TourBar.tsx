import { useNavigate } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import { TOUR_ORDER } from '../../content/tour'

/** PRD v4 §3/§7.3/§9 — replaces TourControls.tsx. Always rendered (no
 * tourMode toggle — there's no longer a separate "tour mode" to opt into,
 * §6), Prev/Next only (autoplay/Play-Pause/Exit are retired along with
 * tourMode). Disables — doesn't wrap — at the first/last stop: a real
 * guided tour doesn't loop from the end back to the start mid-drive. */
export default function TourBar() {
  const activeAttractionId = useCityStore((s) => s.activeAttractionId)
  const navigate = useNavigate()

  const index = TOUR_ORDER.findIndex((a) => a.id === activeAttractionId)
  if (index === -1) return null // transient: mid-scrub (activeAttractionId is null), nothing to show

  const goTo = (i: number) => {
    const stop = TOUR_ORDER[i]
    navigate(`/${stop.district}/${stop.id}`)
  }

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-ink)] px-3 py-2 text-sm text-[var(--color-ground)] shadow-xl">
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous stop"
        className="rounded-full px-2 py-1 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
      >
        ← Prev
      </button>
      <span className="px-1 text-xs text-[var(--color-ground)]/70 tabular-nums">
        {index + 1} / {TOUR_ORDER.length}
      </span>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === TOUR_ORDER.length - 1}
        aria-label="Next stop"
        className="rounded-full bg-[var(--color-foundry)] px-3 py-1 font-medium text-[var(--color-ink)] hover:opacity-90 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
      >
        Next →
      </button>
    </div>
  )
}
