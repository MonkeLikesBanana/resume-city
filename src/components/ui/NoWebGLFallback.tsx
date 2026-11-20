import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DownloadResumeButton from './DownloadResumeButton'
import AccessibleNav from './AccessibleNav'
import AttractionContent from './AttractionContent'
import { DISTRICTS } from '../../content/districts'
import { attractionsByDistrict } from '../../content/attractions'
import { PROFILE_NAME, PROFILE_ROLE } from '../../content/profile'

export default function NoWebGLFallback() {
  const { id } = useParams()

  useEffect(() => {
    const anchor = window.location.hash.slice(1) || id
    if (anchor) document.getElementById(anchor)?.scrollIntoView()
  }, [id])

  return (
    <main id="overview" className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-4xl font-bold">{PROFILE_NAME}</h1>
      <p className="mt-2">{PROFILE_ROLE}</p>
      <p className="mt-3 text-sm text-[var(--color-ink)]/70">Showing the text version.</p>
      <div className="mt-4"><DownloadResumeButton /></div>
      <AccessibleNav forceOpen />

      {Object.values(DISTRICTS).map((district) => (
        <section key={district.id} className="mt-8 border-t border-[var(--color-ink)]/20 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">{district.name}</h2>
          {attractionsByDistrict(district.id).map((attraction) => (
            <article key={attraction.id} id={attraction.id} tabIndex={-1} className="mt-6 scroll-mt-6">
              <h3 className="text-xl font-semibold">{attraction.name}</h3>
              {attraction.district !== 'plaza' && attraction.subtitle && <p className="mt-1 text-sm">{attraction.subtitle}</p>}
              <AttractionContent attraction={attraction} />
              <a href="#overview" className="mt-4 inline-block text-sm underline underline-offset-2">Overview</a>
            </article>
          ))}
        </section>
      ))}
    </main>
  )
}
