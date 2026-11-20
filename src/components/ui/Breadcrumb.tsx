import Button from './Button'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'

export default function Breadcrumb() {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const attraction = activeId ? getAttraction(activeId) : undefined

  return (
    <nav aria-label="Breadcrumb" className="pointer-events-auto fixed top-4 left-4 z-20 flex max-w-[calc(100vw-6.5rem)] flex-wrap items-center gap-1.5 text-sm">
      <Button as="link" to="/">Résumé</Button>
      <Button as="link" to="/city">Overview</Button>
      {attraction && attraction.district !== 'plaza' && (
        <>
          <span aria-hidden="true" className="hidden text-[var(--color-ink)]/40 sm:inline">›</span>
          <span className="hidden rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 text-[var(--color-ink)]/70 shadow-sm sm:inline-block">
            {DISTRICTS[attraction.district].name}
          </span>
          <span aria-hidden="true" className="hidden text-[var(--color-ink)]/40 sm:inline">›</span>
          <span className="hidden rounded-full bg-[var(--color-ground)] px-3 py-1.5 sm:inline">{attraction.name}</span>
        </>
      )}
    </nav>
  )
}
