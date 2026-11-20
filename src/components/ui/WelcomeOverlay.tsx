import Button from './Button'
import { AnimatePresence, motion } from 'framer-motion'
import useCityStore from '../../store/useCityStore'
import useReducedMotion from '../../hooks/useReducedMotion'
import DownloadResumeButton from './DownloadResumeButton'
import { useProgress } from '@react-three/drei'
import { PROFILE_NAME, PROFILE_ROLE } from '../../content/profile'
import ArrowIcon from './ArrowIcon'
import { CITY_NAME } from '../../config'

export default function WelcomeOverlay({ sceneReady }: { sceneReady: boolean }) {
  const { active, progress } = useProgress()
  const ready = sceneReady && !active
  const hasEntered = useCityStore((s) => s.hasEntered)
  const setHasEntered = useCityStore((s) => s.setHasEntered)
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.5, ease: 'easeOut' }}
          className="pointer-events-auto fixed inset-0 z-30 flex flex-col items-center justify-center bg-[var(--color-ground)] px-6 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide">{CITY_NAME}</p>
          <p aria-hidden="true" className="text-5xl font-semibold sm:text-6xl">{PROFILE_NAME}</p>
          <p className="mt-3 max-w-md">{PROFILE_ROLE}</p>
          <p className="mt-3 max-w-md text-sm text-[var(--color-ink)]/75">
            Use Next, Prev, or All stops to move between résumé entries.
          </p>
          <p role="status" className="mt-5 min-h-5 text-sm tabular-nums text-[var(--color-ink)]/70">
            {ready ? '' : `Loading city… ${Math.min(99, Math.floor(progress))}%`}
          </p>

          <Button
            variant="primary"
            disabled={!ready}
            onClick={() => setHasEntered(true)}
            className="mt-3 !px-6 !py-3 !text-lg"
          >
            Enter the City <ArrowIcon direction="right" />
          </Button>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <DownloadResumeButton />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
