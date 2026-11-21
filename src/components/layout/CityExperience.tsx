import type { ResumeEntryId } from '../../content/resume'
import City from '../scene/City'
import CityCanvas from '../scene/CityCanvas'

export default function CityExperience({ activeStop, onFailure }: {
  activeStop: ResumeEntryId
  onFailure: () => void
}) {
  return (
    <CityCanvas activeStop={activeStop} onFailure={onFailure}>
      <City activeStop={activeStop} />
    </CityCanvas>
  )
}
