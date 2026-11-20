import type { Attraction } from '../../types/attraction'

export default function AttractionContent({ attraction }: { attraction: Attraction }) {
  return (
    <>
      {attraction.description && <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]">{attraction.description}</p>}

      {attraction.timeline && (
        <ol className="mt-4 space-y-3 border-l-2 border-[var(--color-ink)]/15 pl-4">
          {attraction.timeline.map((entry) => (
            <li key={entry.role} className="relative">
              <span
                className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ground bg-ink/60"
              />
              <p className="text-[11px] font-medium tracking-wide text-[var(--color-ink)]/70 uppercase">{entry.dateRange}</p>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{entry.role}</p>
              {entry.description && <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-ink)]/85">{entry.description}</p>}
            </li>
          ))}
        </ol>
      )}

      {(attraction.facts || attraction.links) && (
        <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-ink)]/90">
          {attraction.facts?.map((fact) => (
            <li key={fact} className={attraction.district === 'plaza' ? undefined : 'flex gap-2'}>
              {attraction.district !== 'plaza' && (
                <span aria-hidden="true">·</span>
              )}
              {fact}
            </li>
          ))}
          {attraction.links?.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className="underline underline-offset-2">{label}</a>
            </li>
          ))}
        </ul>
      )}

      {attraction.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {attraction.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--color-ink)]/15 px-2.5 py-1 text-xs text-[var(--color-ink)]/80">
              {tag}
            </span>
          ))}
        </div>
      )}

    </>
  )
}
