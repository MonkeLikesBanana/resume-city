import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAttraction } from '../../content/attractions'
import { PROFILE_NAME } from '../../content/profile'
import { HOME_ATTRACTION_ID } from '../../config'
import useCityStore from '../../store/useCityStore'
import CanvasErrorBoundary from '../scene/CanvasErrorBoundary'
import City from '../scene/City'
import CityCanvas from '../scene/CityCanvas'
import AccessibleNav from '../ui/AccessibleNav'
import Breadcrumb from '../ui/Breadcrumb'
import CityLoading from '../ui/CityLoading'
import ExploreScrubBar from '../ui/ExploreScrubBar'
import InfoPanel from '../ui/InfoPanel'
import NoWebGLFallback from '../ui/NoWebGLFallback'
import TourBar from '../ui/TourBar'
import Header from './Header'

export default function CityExperience() {
  const { id } = useParams()
  const navigate = useNavigate()
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const webglSupported = useCityStore((s) => s.webglSupported)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const attraction = getAttraction(id ?? HOME_ATTRACTION_ID)
    setActive(attraction?.id ?? HOME_ATTRACTION_ID)
    const stopName = attraction?.district === 'plaza' ? attraction.placeName : attraction?.name
    document.title = id && stopName ? `${stopName} — ${PROFILE_NAME}` : `3D Portfolio — ${PROFILE_NAME}`
  }, [id, setActive])

  useEffect(() => {
    if (!webglSupported || !sceneReady) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/city')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, sceneReady, webglSupported])

  if (!webglSupported) return <NoWebGLFallback />

  return (
    <CanvasErrorBoundary>
      <div className="relative h-full w-full">
        <h1 className="sr-only">{PROFILE_NAME}</h1>
        <div className="absolute inset-0">
          <CityCanvas onReady={setSceneReady}><City /></CityCanvas>
        </div>
        {sceneReady ? (
          <>
            <Breadcrumb />
            <AccessibleNav />
            <Header />
            <InfoPanel />
            <TourBar />
            <ExploreScrubBar />
          </>
        ) : <CityLoading />}
      </div>
    </CanvasErrorBoundary>
  )
}
