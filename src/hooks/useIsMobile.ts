import { useEffect, useState } from 'react'

/** PRD §11 — the `< 768px` breakpoint used throughout for mobile behavior
 * (shadow resolution, dpr cap, full-screen InfoPanel). */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
