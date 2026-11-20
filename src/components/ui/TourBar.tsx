import useCityStore from '../../store/useCityStore'
import { TOUR_ORDER } from '../../content/tour'
import ArrowIcon from './ArrowIcon'
import Button from './Button'
import DownloadResumeButton from './DownloadResumeButton'

interface TourBarProps {
  mobile?: boolean
}

export default function TourBar({ mobile = false }: TourBarProps) {
  const activeId = useCityStore((s) => s.activeAttractionId)
  const index = TOUR_ORDER.findIndex((stop) => stop.id === activeId)
  if (index < 0) return null

  const previous = TOUR_ORDER[index - 1]
  const next = TOUR_ORDER[index + 1]
  const classes = mobile
    ? 'mt-2 flex flex-wrap items-center gap-1.5 sm:hidden'
    : 'pointer-events-auto fixed bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--color-ground)] p-2 shadow-lg sm:flex'

  return (
    <nav aria-label="Tour navigation" className={classes}>
      {previous ? (
        <Button as="link" to={index === 1 ? '/city' : `/${previous.district}/${previous.id}`} aria-label="Previous stop">
          <ArrowIcon direction="left" /> Prev
        </Button>
      ) : (
        <Button disabled aria-label="Previous stop"><ArrowIcon direction="left" /> Prev</Button>
      )}
      <span className="text-xs text-[var(--color-ink)]/75 tabular-nums">
        {index + 1} / {TOUR_ORDER.length}
      </span>
      {next ? (
        <>
          <Button as="link" to={`/${next.district}/${next.id}`} variant="primary" aria-label="Next stop">
            Next <ArrowIcon direction="right" />
          </Button>
          {mobile && <DownloadResumeButton className="ml-auto" />}
        </>
      ) : (
        <>
          <Button as="link" to="/city" variant="primary">Back to overview</Button>
          {mobile && <DownloadResumeButton label="Download résumé" />}
        </>
      )}
    </nav>
  )
}
