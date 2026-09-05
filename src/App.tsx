import CityCanvas from './components/scene/CityCanvas'
import Building from './components/scene/Building'
import { CITY_NAME } from './config'

// PRD §13 Phase 1 — static scene: ground/lake/bridge + a handful of sample
// buildings, no camera system or interactivity yet. Confirms the Pacific NW
// art direction reads correctly before scaling up to full content (Phase 3).
export default function App() {
  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10 font-[Fredoka] text-lg text-[var(--color-ink)]">
        {CITY_NAME} — Phase 1 art-direction check
      </div>
      <CityCanvas>
        <Building model="/assets/models/robotics-workshop.glb" position={[-14, 0, -6]} />
        <Building model="/assets/models/cafe.glb" position={[14, 0, -8]} scale={3} rotationY={Math.PI} />
        <Building model="/assets/models/academic-hall.glb" position={[-24, 0, 6]} scale={3} />
        <Building model="/assets/models/tree-pine-a.glb" position={[10, 0, -12]} scale={6} />
        <Building model="/assets/models/tree-pine-tall.glb" position={[-8, 0, -14]} scale={6} />
      </CityCanvas>
    </div>
  )
}
