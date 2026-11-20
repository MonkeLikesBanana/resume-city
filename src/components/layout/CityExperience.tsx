import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TOUR_ORDER } from '../../content/tour'
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
import InfoPanel from '../ui/InfoPanel'
import NoWebGLFallback from '../ui/NoWebGLFallback'
import TourBar from '../ui/TourBar'
import Header from './Header'
import '../../styles/city.css'

export default function CityExperience() {
  const { id } = useParams()
  const navigate = useNavigate()
  const setActive = useCityStore((s) => s.setActiveAttractionId)
  const webglSupported = useCityStore((s) => s.webglSupported)
  const [sceneReady, setSceneReady] = useState(false)
  const [panelHeight, setPanelHeight] = useState<number>()

  useEffect(() => {
    const attraction = getAttraction(id ?? HOME_ATTRACTION_ID)
    setActive(attraction?.id ?? HOME_ATTRACTION_ID)
    const stopName = attraction?.district === 'plaza' ? attraction.placeName : attraction?.name
    document.title = id && stopName ? `${stopName} — ${PROFILE_NAME}` : `3D Portfolio — ${PROFILE_NAME}`
  }, [id, setActive])

  useEffect(() => {
    if (!webglSupported || !sceneReady) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key === 'Escape') {
        navigate('/city')
      } else if (!event.repeat && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const active = useCityStore.getState().activeAttractionId
        const index = TOUR_ORDER.findIndex(stop => stop.id === active)
        const stop = TOUR_ORDER[index + (event.key === 'ArrowRight' ? 1 : -1)]
        if (stop) {
          event.preventDefault()
          navigate(stop.district === 'plaza' ? '/city' : `/${stop.district}/${stop.id}`)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, sceneReady, webglSupported])

  if (!webglSupported) return <NoWebGLFallback />

  return (
    <CanvasErrorBoundary>
      <div className="city-experience" style={panelHeight ? { '--city-panel-height': `${panelHeight}px` } as CSSProperties : undefined}>
        <h1 className="sr-only">{PROFILE_NAME}</h1>
        <div className="city-stage">
          <CityCanvas initialStopId={id ?? HOME_ATTRACTION_ID} onReady={setSceneReady}><City /></CityCanvas>
        </div>
        {sceneReady ? (
          <>
            <Breadcrumb />
            <AccessibleNav />
            <Header />
            <InfoPanel onHeight={setPanelHeight} />
            <TourBar />
          </>
        ) : <CityLoading />}
      </div>
    </CanvasErrorBoundary>
  )
}
