import { Link } from 'react-router-dom'
import { attractionsByDistrict } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'
import Button from './Button'
import Chevron from './Chevron'

function StopsList({ inline = false }: { inline?: boolean }) {
  const districts = Object.values(DISTRICTS).filter(({ id }) => !inline || id !== 'plaza')

  return (
    <nav aria-label="All stops" className={inline ? 'mt-6 text-sm' : 'max-h-[70vh] w-64 overflow-y-auto rounded-xl bg-[var(--color-ground)] p-3 shadow-xl'}>
      {districts.map((district) => (
        <div key={district.id} className="mb-3 last:mb-0">
          <p className="text-xs font-semibold uppercase tracking-wide">{district.name}</p>
          <ul>
            {attractionsByDistrict(district.id).map((stop) => (
              <li key={stop.id}>
                {inline ? (
                  <a className="block py-1 underline underline-offset-2" href={`#${stop.id}`}>{stop.name}</a>
                ) : (
                  <Link to={stop.district === 'plaza' ? '/' : `/${stop.district}/${stop.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-[var(--color-ink)]/5">
                    {stop.district === 'plaza' ? 'Overview' : stop.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
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
      <div className="mt-2">
        <StopsList />
      </div>
    </details>
  )
}
