import { useEffect, useRef, useState } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import CityCanvas from './components/scene/CityCanvas'
import CanvasErrorBoundary from './components/scene/CanvasErrorBoundary'
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
import { PROFILE_NAME } from './content/profile'
import { HOME_ATTRACTION_ID } from './config'

/** Keep the active stop in sync with the URL so deep links and browser history land at the right stop. */
function RouteSync() {
  const { id } = useParams<{ district: string; id: string }>()
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const setHasEntered = useCityStore((s) => s.setHasEntered)
  const isFirstRun = useRef(true)

  useEffect(() => {
    const attraction = getAttraction(id ?? HOME_ATTRACTION_ID)
    setActive(attraction?.id ?? HOME_ATTRACTION_ID)
    const stopName = attraction?.district === 'plaza' ? attraction.placeName : attraction?.name
    document.title = id && stopName ? `${stopName} — ${PROFILE_NAME}` : `${PROFILE_NAME} — Résumé`

    if (isFirstRun.current) {
      isFirstRun.current = false
      // Open valid deep links directly. The home route shows the welcome screen on a fresh visit.
      if (id && attraction) setHasEntered(true)
    }
  }, [id, setActive, setHasEntered])

  return null
}

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

  const [sceneReady, setSceneReady] = useState(false)

  return (
    <>
      <RouteSync />
      {webglSupported ? (
        <CanvasErrorBoundary>
          <div className="relative h-full w-full">
            <h1 className="sr-only">{PROFILE_NAME}</h1>
            <EscapeToOverview />
            <div inert={!hasEntered}>
              <div className="absolute inset-0">
                <CityCanvas onReady={setSceneReady}>
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
            <WelcomeOverlay sceneReady={sceneReady} />
          </div>
        </CanvasErrorBoundary>
      ) : (
        <NoWebGLFallback />
      )}
    </>
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
