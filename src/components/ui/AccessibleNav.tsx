import { Link } from 'react-router-dom'
import { TOUR_ORDER } from '../../content/tour'
import Button from './Button'
import Chevron from './Chevron'

function StopsList({ inline = false }: { inline?: boolean }) {
  return (
    <nav aria-label="All stops" className={inline ? 'mt-2 text-sm' : 'max-h-[70vh] w-64 overflow-y-auto rounded-xl bg-ground p-3 shadow-xl'}>
      <ul className={inline ? 'flex flex-wrap gap-x-4 gap-y-1' : ''}>
        {TOUR_ORDER.map((stop) => {
          const plaza = stop.district === 'plaza'
          const label = plaza ? 'Overview' : stop.name
          return (
            <li key={stop.id}>
              {inline ? (
                <a href={`#${stop.id}`}>{label}</a>
              ) : (
                <Link to={plaza ? '/city' : `/${stop.district}/${stop.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-ink/5">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default function AccessibleNav({ forceOpen = false }: { forceOpen?: boolean }) {
  if (forceOpen) return <StopsList inline />

  return (
    <details
      className="group pointer-events-auto fixed top-4 right-4 z-[25] text-sm"
      onClick={(event) => {
        if ((event.target as Element).closest('a')) event.currentTarget.open = false
      }}
    >
      <Button as="summary" className="ml-auto !flex w-28 list-none select-none [&::-webkit-details-marker]:hidden">
        All stops <Chevron className="group-open:rotate-180" />
      </Button>
      <div className="mt-2"><StopsList /></div>
    </details>
  )
}
