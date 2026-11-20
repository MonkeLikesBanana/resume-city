import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import { getAttraction } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'
import { TOUR_ORDER } from '../../content/tour'
import useReducedMotion from '../../hooks/useReducedMotion'
import { ACCENT_FILL, ACCENT_TEXT } from '../../config'
import DownloadResumeButton from './DownloadResumeButton'

import AttractionContent from './AttractionContent'
import ArrowIcon from './ArrowIcon'

/** PRD §8/§9 — plain DOM overlay, NOT an in-canvas <Html> panel: real,
 * independent HTML so screen readers/crawlers get the actual resume content
 * regardless of whether the 3D scene rendered (§10). Framer Motion handles
 * this panel's enter/exit — camera movement is a separate system (§7.3). */
export default function InfoPanel() {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const attraction = activeId ? getAttraction(activeId) : undefined
  const tourIndex = TOUR_ORDER.findIndex((a) => a.id === activeId)

  return (
    <AnimatePresence>
      {attraction && (
        <motion.aside
          key={attraction.id}
          role="region"
          aria-label={attraction.name}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.35, ease: 'easeOut' }}
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t-4 bg-[var(--color-ground)]/97 p-5 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[420px] sm:rounded-2xl sm:border-t-0 sm:border-l-4"
          style={{ borderColor: ACCENT_FILL[attraction.accentColor] }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: ACCENT_TEXT[attraction.accentColor] }}>
                {attraction.placeName ?? DISTRICTS[attraction.district].name}
              </p>
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">{attraction.name}</h2>
              {attraction.subtitle && <p className="mt-0.5 text-sm text-[var(--color-ink)]/70">{attraction.subtitle}</p>}
            </div>
            {attraction.district !== 'plaza' && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="shrink-0 rounded-full border border-[var(--color-ink)]/20 px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 cursor-pointer"
              >
                <ArrowIcon direction="left" /> Overview
              </button>
            )}
          </div>

          {/* PRD v7.0 round 4 — mobile-only: TourBar's Prev/Next and
              Header's résumé download both float at fixed viewport
              positions that land inside this panel's own full-width
              mobile footprint (see each component's own comment) —
              rather than trying to keep two independently-fixed overlays
              clear of a third that can change height with its content,
              these controls live inside the panel itself on mobile, so
              they reflow with it instead of racing it. */}
          {tourIndex !== -1 && (
            <div className="mt-3 flex items-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => navigate(`/${TOUR_ORDER[tourIndex - 1].district}/${TOUR_ORDER[tourIndex - 1].id}`)}
                disabled={tourIndex === 0}
                aria-label="Previous stop"
                className="rounded-full border border-[var(--color-ink)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowIcon direction="left" /> Prev
              </button>
              <span className="text-xs text-[var(--color-ink)]/60 tabular-nums">
                {tourIndex + 1} / {TOUR_ORDER.length}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/${TOUR_ORDER[tourIndex + 1].district}/${TOUR_ORDER[tourIndex + 1].id}`)}
                disabled={tourIndex === TOUR_ORDER.length - 1}
                aria-label="Next stop"
                className="rounded-full px-2.5 py-1 text-xs font-medium text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-30"
                style={{ background: ACCENT_FILL[attraction.accentColor] }}
              >
                Next <ArrowIcon direction="right" />
              </button>
              <DownloadResumeButton className="ml-auto" />
            </div>
          )}

          <AttractionContent attraction={attraction} />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
