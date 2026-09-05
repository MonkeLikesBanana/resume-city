import { useEffect } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import CityCanvas from './components/scene/CityCanvas'
import City from './components/scene/City'
import Breadcrumb from './components/ui/Breadcrumb'
import InfoPanel from './components/ui/InfoPanel'
import AccessibleNav from './components/ui/AccessibleNav'
import useCityStore from './store/useCityStore'
import { getAttraction } from './content/attractions'
import { CITY_NAME } from './config'

/** PRD §3/§10 — the URL is the source of truth for "which attraction is
 * active"; this is the only place that writes activeAttractionId. Landing
 * directly on a deep link (or navigating browser back/forward) reaches the
 * right stop with no extra click. */
function RouteSync() {
  const { id } = useParams<{ district: string; id: string }>()
  const setActive = useCityStore((s) => s.setActiveAttractionId)

  useEffect(() => {
    const attraction = id ? getAttraction(id) : undefined
    setActive(attraction?.id ?? null)
    // PRD §10 — per-route <title>, since this is a client-rendered SPA with no SSR.
    document.title = attraction ? `${attraction.name} — ${CITY_NAME}` : `${CITY_NAME} — Aarav Vaswani`
  }, [id, setActive])

  return null
}

/** PRD §10 — "Escape closes the panel and flies back to overview." */
function EscapeToOverview() {
  const navigate = useNavigate()
  const activeId = useCityStore((s) => s.activeAttractionId)

  useEffect(() => {
    if (!activeId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, navigate])

  return null
}

// An unknown :id in the URL just resolves to null in RouteSync above — the
// city falls back to the overview shot rather than dead-ending on a 404.
function Experience() {
  return (
    <div className="relative h-full w-full">
      <RouteSync />
      <EscapeToOverview />
      <div className="absolute inset-0">
        <CityCanvas>
          <City />
        </CityCanvas>
      </div>
      <Breadcrumb />
      <AccessibleNav />
      <InfoPanel />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Experience />} />
      <Route path="/:district/:id" element={<Experience />} />
    </Routes>
  )
}
