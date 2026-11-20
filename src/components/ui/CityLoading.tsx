import { useProgress } from '@react-three/drei'
import Button from './Button'

export default function CityLoading() {
  const progress = useProgress((state) => state.progress)

  return (
    <div className="absolute inset-0 z-30 grid place-content-center gap-4 bg-ground text-center">
      <p role="status">Loading the 3D portfolio… {Math.min(99, Math.floor(progress))}%</p>
      <Button as="link" to="/" className="justify-self-center">Back to résumé</Button>
    </div>
  )
}
