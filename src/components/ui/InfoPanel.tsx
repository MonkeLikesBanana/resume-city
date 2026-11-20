import { useId, useState } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'
import useReducedMotion from '../../hooks/useReducedMotion'
import { ACCENT_FILL, ACCENT_TEXT } from '../../config'
import type { Attraction } from '../../types/attraction'
import AttractionContent from './AttractionContent'
import Button from './Button'
import Chevron from './Chevron'
import ProfileSkills from './ProfileSkills'
import TourBar from './TourBar'

function Panel({ attraction }: { attraction: Attraction }) {
  const isPresent = useIsPresent()
  const reducedMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()

  return (
    <motion.aside
      aria-label={attraction.name}
      inert={!isPresent}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.35, ease: 'easeOut' }}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t-4 bg-[var(--color-ground)] p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-16 sm:w-[420px] sm:rounded-2xl sm:border-t-0 sm:border-l-4 sm:p-5 xl:bottom-4"
      style={{ borderColor: ACCENT_FILL[attraction.accentColor] }}
    >
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT_TEXT[attraction.accentColor] }}>
              {attraction.placeName ?? DISTRICTS[attraction.district].name}
            </p>
            <h2>
              <span className="hidden text-xl font-semibold sm:inline">{attraction.name}</span>
              <Button
                className="mt-1 w-full !justify-between text-left !text-base sm:hidden"
                aria-expanded={expanded}
                aria-controls={detailsId}
                onClick={() => setExpanded((open) => !open)}
              >
                {attraction.name}
                <Chevron className={expanded ? 'rotate-180' : ''} />
              </Button>
            </h2>
          </div>
          {attraction.district !== 'plaza' && (
            <Button as="link" to="/" className="hidden shrink-0 sm:inline-flex">Overview</Button>
          )}
        </div>
        <TourBar mobile />
      </header>

      <div id={detailsId} className={expanded ? '' : 'hidden sm:block'}>
        {attraction.subtitle && <p className="mt-1 text-sm text-[var(--color-ink)]/75">{attraction.subtitle}</p>}
        <AttractionContent attraction={attraction} />
        {attraction.district === 'plaza' && <ProfileSkills />}
      </div>
    </motion.aside>
  )
}

export default function InfoPanel() {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const attraction = activeId ? getAttraction(activeId) : undefined

  return (
    <AnimatePresence>
      {attraction && <Panel key={attraction.id} attraction={attraction} />}
    </AnimatePresence>
  )
}
