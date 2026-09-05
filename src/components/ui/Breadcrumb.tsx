import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'
import { CITY_NAME } from '../../config'

/** PRD §3/§9 — "Aaravville › District › Building", each level clickable.
 * Basic version here; Phase 4 makes the district level a real navigation
 * target once routing exists. */
export default function Breadcrumb() {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const attraction = activeId ? getAttraction(activeId) : undefined

  return (
    <nav aria-label="Breadcrumb" className="pointer-events-auto fixed top-4 left-4 z-20 flex items-center gap-1.5 text-sm">
      <button
        type="button"
        onClick={() => setActive(null)}
        className="rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 font-[Fredoka] font-semibold text-[var(--color-ink)] shadow-sm hover:underline cursor-pointer"
      >
        {CITY_NAME}
      </button>
      {attraction && (
        <>
          <span className="text-[var(--color-ink)]/40">›</span>
          <span className="rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 text-[var(--color-ink)]/70 shadow-sm">
            {DISTRICTS[attraction.district].name}
          </span>
          <span className="text-[var(--color-ink)]/40">›</span>
          <span className="rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 text-[var(--color-ink)] shadow-sm">{attraction.name}</span>
        </>
      )}
    </nav>
  )
}
