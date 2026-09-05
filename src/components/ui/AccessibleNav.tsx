import { Link } from 'react-router-dom'
import { ATTRACTIONS } from '../../content/attractions'
import { DISTRICTS } from '../../content/districts'
import type { District } from '../../types/attraction'

const ORDER: District[] = ['plaza', 'foundry', 'lakeside']

/** PRD §10 — a real, always-present list of every stop, each a real link to
 * its deep-link route. This is NOT a screen-reader-only fallback bolted on
 * at the end: a <canvas> has no semantic content at all, so for a visitor
 * on a screen reader (or a browser where WebGL fails, §6) this list *is*
 * the site. Built alongside routing per §13 Phase 4, not deferred. */
export default function AccessibleNav() {
  return (
    <details className="pointer-events-auto fixed top-4 right-4 z-20 text-sm">
      <summary className="cursor-pointer list-none rounded-full bg-[var(--color-ground)]/90 px-3 py-1.5 font-medium text-[var(--color-ink)] shadow-sm select-none">
        All stops
      </summary>
      <nav aria-label="All stops in the city" className="mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl bg-[var(--color-ground)]/97 p-3 shadow-xl">
        {ORDER.map((districtId) => (
          <div key={districtId} className="mb-3 last:mb-0">
            <p className="px-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink)]/50 uppercase">{DISTRICTS[districtId].name}</p>
            <ul>
              {ATTRACTIONS.filter((a) => a.district === districtId).map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/${a.district}/${a.id}`}
                    className="block rounded-lg px-2 py-1.5 text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link to="/" className="mt-1 block rounded-lg px-2 py-1.5 font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5">
          ← Back to overview
        </Link>
      </nav>
    </details>
  )
}
