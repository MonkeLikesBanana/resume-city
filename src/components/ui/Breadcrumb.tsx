import { Link } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'

export default function Breadcrumb() {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const attraction = activeId ? getAttraction(activeId) : undefined

  return (
    // max-w + flex-wrap: on a narrow phone screen a full "City › District ›
    // Attraction" trail can run long enough to collide with the "All stops"
    // pill (top-right) — wrap to a second line instead of overlapping it.
    // The district segment (least essential of the three) is also dropped
    // below `sm` to keep the common case to one short line.
    <nav aria-label="Breadcrumb" className="pointer-events-auto fixed top-4 left-4 z-20 flex max-w-[calc(100vw-6.5rem)] flex-wrap items-center gap-1.5 text-sm">
      <Link
        to="/"
        className="rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 font-semibold text-[var(--color-ink)] shadow-sm hover:underline"
      >
        Overview
      </Link>
      {attraction && attraction.district !== 'plaza' && (
        <>
          <span aria-hidden="true" className="hidden text-[var(--color-ink)]/40 sm:inline">›</span>
          <span className="hidden rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 text-[var(--color-ink)]/70 shadow-sm sm:inline-block">
            {DISTRICTS[attraction.district].name}
          </span>
          <span aria-hidden="true" className="text-[var(--color-ink)]/40">›</span>
          <span className="rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 text-[var(--color-ink)] shadow-sm">{attraction.name}</span>
        </>
      )}
    </nav>
  )
}
