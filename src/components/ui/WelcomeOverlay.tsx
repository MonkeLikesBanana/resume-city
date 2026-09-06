import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useCityStore from '../../store/useCityStore'
import useReducedMotion from '../../hooks/useReducedMotion'
import DownloadResumeButton from './DownloadResumeButton'
import { CITY_NAME } from '../../config'
import { TOUR_ORDER } from '../../content/tour'

/** PRD §3/§13 Phase 5 — the landing gate. Deep links bypass this entirely
 * (App.tsx sets hasEntered=true on mount if the URL already names a stop);
 * visiting "/" fresh shows it once per session. */
export default function WelcomeOverlay() {
  const hasEntered = useCityStore((s) => s.hasEntered)
  const setHasEntered = useCityStore((s) => s.setHasEntered)
  const setTourMode = useCityStore((s) => s.setTourMode)
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()

  const startTour = () => {
    setHasEntered(true)
    setTourMode(true)
    const first = TOUR_ORDER[0]
    navigate(`/${first.district}/${first.id}`)
  }

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.5, ease: 'easeOut' }}
          className="pointer-events-auto fixed inset-0 z-30 flex flex-col items-center justify-center bg-[var(--color-ground)] px-6 text-center"
        >
          <svg width="88" height="88" viewBox="0 0 108 108" aria-hidden="true" className="mb-4">
            <polyline
              points="14,78 14,60 24,60 24,50 34,50 34,66 44,66 44,40 56,40 56,66 66,66 66,52 78,52 78,64 94,64 94,78"
              fill="none"
              stroke="var(--color-evergreen)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polygon points="20,50 26,38 32,50" fill="var(--color-foundry)" />
            <polygon points="70,44 76,30 82,44" fill="var(--color-lakeside)" />
            <line x1="14" y1="78" x2="94" y2="78" stroke="var(--color-mountain)" strokeWidth="2" />
          </svg>

          <h1 className="font-[Fredoka] text-5xl font-semibold text-[var(--color-ink)] sm:text-6xl">{CITY_NAME}</h1>
          <p className="mt-3 max-w-md text-[var(--color-ink)]/70">
            Aarav Vaswani's résumé, built as a small city — click a building, the camera drives you there.
          </p>

          <button
            type="button"
            onClick={() => setHasEntered(true)}
            className="mt-8 rounded-full bg-[var(--color-foundry)] px-6 py-3 font-[Fredoka] text-lg font-semibold text-[var(--color-ink)] shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            Enter the City →
          </button>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <button type="button" onClick={startTour} className="text-[var(--color-ink)]/70 underline hover:text-[var(--color-ink)] cursor-pointer">
              Take the guided tour
            </button>
            <span className="text-[var(--color-ink)]/30">·</span>
            <DownloadResumeButton />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
