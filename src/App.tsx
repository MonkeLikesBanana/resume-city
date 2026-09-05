import CityCanvas from './components/scene/CityCanvas'
import City from './components/scene/City'
import Breadcrumb from './components/ui/Breadcrumb'
import InfoPanel from './components/ui/InfoPanel'

export default function App() {
  return (
    <div className="relative h-full w-full">
      <CityCanvas>
        <City />
      </CityCanvas>
      <Breadcrumb />
      <InfoPanel />
    </div>
  )
}
