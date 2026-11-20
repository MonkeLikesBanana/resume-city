import { Navigate, useParams } from 'react-router-dom'
import { RESUME_ENTRIES } from '../../content/resume'

export default function NoWebGLFallback() {
  const { id } = useParams()
  const hash = id && Object.hasOwn(RESUME_ENTRIES, id) ? `#${id}` : ''

  return <Navigate to={{ pathname: '/', hash }} replace state={{ cityUnavailable: true }} />
}
