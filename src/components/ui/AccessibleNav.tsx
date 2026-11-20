import { Link } from 'react-router-dom'
import { TOUR_ORDER } from '../../content/tour'
import Button from './Button'
import Chevron from './Chevron'

export default function AccessibleNav() {
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
      <nav aria-label="All stops" className="mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl bg-ground p-3 shadow-xl">
        <ul>
          {TOUR_ORDER.map((stop) => (
            <li key={stop.id}>
              <Link to={stop.district === 'plaza' ? '/city' : `/${stop.district}/${stop.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-ink/5">
                {stop.district === 'plaza' ? 'Overview' : stop.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
