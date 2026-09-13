import { useEffect, useRef } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import CityCanvas from './components/scene/CityCanvas'
import City from './components/scene/City'
import Breadcrumb from './components/ui/Breadcrumb'
import InfoPanel from './components/ui/InfoPanel'
import AccessibleNav from './components/ui/AccessibleNav'
import WelcomeOverlay from './components/ui/WelcomeOverlay'
import TourBar from './components/ui/TourBar'
import ExploreScrubBar from './components/ui/ExploreScrubBar'
import Header from './components/layout/Header'
import NoWebGLFallback from './components/ui/NoWebGLFallback'
import useCityStore from './store/useCityStore'
import { getAttraction } from './content/attractions'
import { CITY_NAME, HOME_ATTRACTION_ID } from './config'

/** PRD §3/§10 — the URL is the source of truth for "which attraction is
 * active"; this is the only place that writes activeAttractionId on a real
 * navigation (the explore-yourself scrub, PRD v4 §7.5, sets it directly and
 * transiently while gliding — that's the one exception). Landing directly on
 * a deep link (or navigating browser back/forward) reaches the right stop
 * with no extra click. Also bypasses the welcome overlay on the very first
 * render if the URL already names a stop (§3: "deep links skip the welcome
 * overlay"). PRD v4 §3/§8: bare "/" now resolves to the Welcome Plaza's own
 * id, not null — it's selected from the start, not a neutral home state. */
function RouteSync() {
  const { id } = useParams<{ district: string; id: string }>()
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const setHasEntered = useCityStore((s) => s.setHasEntered)
  const isFirstRun = useRef(true)

  useEffect(() => {
    const attraction = getAttraction(id ?? HOME_ATTRACTION_ID)
    setActive(attraction?.id ?? HOME_ATTRACTION_ID)
    document.title = attraction ? `${attraction.name} — ${CITY_NAME}` : `${CITY_NAME} — Aarav Vaswani`

    if (isFirstRun.current) {
      isFirstRun.current = false
      // Skip the welcome overlay only for a REAL deep link — `attraction` is
      // truthy even on bare "/" now (it resolves to the Welcome Plaza, §3),
      // so the gate has to check that the URL actually named a stop, not
      // just that an attraction was found.
      if (id && attraction) setHasEntered(true)
    }
  }, [id, setActive, setHasEntered])

  return null
}

/** PRD §10 — "Escape closes the panel and drives back to the Welcome Plaza"
 * (PRD v2 §7: the Plaza is the city's home state — there's no more free-roam
 * overview shot to fall back to). */
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

// An unknown :id in the URL just resolves to the Welcome Plaza in RouteSync
// above — the city falls back there rather than dead-ending on a 404.
function Experience() {
  const webglSupported = useCityStore((s) => s.webglSupported)
  const hasEntered = useCityStore((s) => s.hasEntered)

  if (!webglSupported) return <NoWebGLFallback />

  return (
    <div className="relative h-full w-full">
      <RouteSync />
      <EscapeToOverview />
      {/* inert while the welcome overlay covers the screen: without this, a
          keyboard user tabs through a dozen visually-hidden hotspot buttons
          before ever reaching "Enter the City" — inert removes the whole
          subtree from both the tab order and the accessibility tree until
          it's actually visible. */}
      <div inert={!hasEntered}>
        {/* isolate: drei's <Html> markers set very high inline z-indices for
            depth-sorting between themselves; without a stacking context here
            those values escape this wrapper and paint over siblings below
            (Welcome overlay, InfoPanel) regardless of this div's own z-index. */}
        <div className="absolute inset-0 isolate">
          <CityCanvas>
            <City />
          </CityCanvas>
        </div>
        <Breadcrumb />
        <AccessibleNav />
        <Header />
        <InfoPanel />
        <TourBar />
        <ExploreScrubBar />
      </div>
      <WelcomeOverlay />
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
