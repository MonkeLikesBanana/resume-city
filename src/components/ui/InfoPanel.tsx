import { useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { TOUR_ORDER } from '../../content/tour'
import { DISTRICTS } from '../../content/districts'
import useReducedMotion from '../../hooks/useReducedMotion'
import type { Attraction } from '../../types/attraction'
import AttractionContent from './AttractionContent'
import Button from './Button'
import Chevron from './Chevron'
import ProfileSkills from './ProfileSkills'
import TourBar from './TourBar'

function Panel({ attraction, onHeight }: { attraction: Attraction; onHeight?: (height: number) => void }) {
  const isPresent = useIsPresent()
  const reducedMotion = useReducedMotion()
  const isPlaza = attraction.district === 'plaza'
  const isLastStop = attraction.id === TOUR_ORDER.at(-1)?.id
  const [expanded, setExpanded] = useState(isPlaza)
  const detailsId = useId()

  const panelRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!isPresent || !onHeight || !panel) return
    const measure = () => onHeight(panel.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [isPresent, onHeight])

  return (
    <motion.aside
      ref={panelRef}
      aria-label={attraction.name}
      inert={!isPresent}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.35, ease: 'easeOut' }}
      className="city-panel"
    >
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
              {attraction.placeName ?? DISTRICTS[attraction.district].name}
            </p>
            <h2 className="text-xl font-semibold">{attraction.name}</h2>
            {attraction.subtitle && <p className="mt-1 text-sm text-[var(--color-ink)]/75">{attraction.subtitle}</p>}
          </div>
          <Button
            className="shrink-0 !border-transparent !px-2 hover:underline min-[900px]:hidden"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((open) => !open)}
          >
            Details <Chevron className={expanded ? 'rotate-180' : ''} />
          </Button>
          {!isPlaza && !isLastStop && (
            <Button as="link" to="/city" className="city-panel-overview shrink-0">Overview</Button>
          )}
        </div>
        <TourBar mobile />
      </header>

      <div id={detailsId} className={expanded ? '' : 'hidden min-[900px]:block'}>
        <AttractionContent attraction={attraction} />
        {isPlaza && <ProfileSkills />}
      </div>
    </motion.aside>
  )
}

export default function InfoPanel({ onHeight }: { onHeight?: (height: number) => void }) {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const attraction = activeId ? getAttraction(activeId) : undefined

  return (
    <AnimatePresence>
      {attraction && <Panel key={attraction.id} attraction={attraction} onHeight={onHeight} />}
    </AnimatePresence>
  )
}
