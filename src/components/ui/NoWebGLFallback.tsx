import ResumePage from '../layout/ResumePage'
import AccessibleNav from './AccessibleNav'

export default function NoWebGLFallback() {
  return <ResumePage fallbackNav={<AccessibleNav forceOpen />} />
}
