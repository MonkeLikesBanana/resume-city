import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CONTACT, INTERESTS, PROFILE_LOCATION, PROFILE_NAME, PROFILE_ROLE, PROFILE_SKILLS, PROFILE_SUMMARY, SITE_URL_LABEL } from '../../content/profile'
import { RESUME_ENTRIES, type ResumeEntry, type ResumeEntryId } from '../../content/resume'
import { TOUR_CHAPTERS } from '../../content/tour'
import { HOME_ATTRACTION_ID } from '../../config'
import { isWebGL2Supported } from '../../lib/webgl'
import AccessibleNav from '../ui/AccessibleNav'
import CanvasErrorBoundary from '../scene/CanvasErrorBoundary'
import '../../styles/life-tour.css'

const legacyAnchors = new Map([['outside-work', 'interests'], ['experience', 'building']])

function Chapter({ index, children }: { index: number; children: ReactNode }) {
  const chapter = TOUR_CHAPTERS[index]

  return (
    <section id={chapter.id} className="life-chapter" tabIndex={-1} aria-labelledby={`${chapter.id}-title`} data-chapter={chapter.id} data-city-stop={chapter.cityStop}>
      <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
      <p className="life-chapter-intro">{chapter.introduction}</p>
      {children}
    </section>
  )
}

function Entry({ entryId, anchor = entryId, roles }: {
  entryId: ResumeEntryId
  anchor?: string
  roles?: readonly string[]
}) {
  const entry: ResumeEntry = RESUME_ENTRIES[entryId]
  const timeline = entry.timeline?.filter(role => !roles || roles.includes(role.role)) ?? []
  const facts = entry.facts ?? []

  return (
    <article id={anchor} className="life-entry" tabIndex={-1} data-city-stop={entryId}>
      <h3>{entry.name}</h3>
      <dl className="life-roles">
        {timeline.map(role => (
          <div key={role.role}>
            <dt>{role.role}</dt>
            <dd className="life-date">{role.dateRange}</dd>
            {role.description && <dd>{role.description}</dd>}
          </div>
        ))}
      </dl>
      {facts.length > 0 && <ul className="life-facts">{facts.map(fact => <li key={fact}>{fact}</li>)}</ul>}
    </article>
  )
}

function useReadingPosition() {
  const [position, setPosition] = useState<{ stop: ResumeEntryId; chapter: string }>({ stop: HOME_ATTRACTION_ID, chapter: HOME_ATTRACTION_ID })

  useEffect(() => {
    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-city-stop]'))
    let frame = 0
    const update = () => {
      frame = 0
      const readingLine = Math.min(window.innerHeight * .47, 360)
      let current = markers[0]
      for (const marker of markers) {
        if (marker.getBoundingClientRect().top > readingLine) break
        current = marker
      }
      const focused = document.activeElement
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement
      const atEnd = scrollTop > 0 && scrollHeight - clientHeight - scrollTop < 2
      if (atEnd) {
        // The final entry can exhaust the scroll range before it reaches the reading line.
        current = markers[markers.length - 1]
      }
      if (focused instanceof HTMLElement && markers.includes(focused)) {
        const top = focused.getBoundingClientRect().top
        const inset = parseFloat(getComputedStyle(focused).scrollMarginTop)
        if (Math.abs(top - inset) < 2 || (atEnd && top >= inset && top < clientHeight)) {
          current = focused
        }
      }
      if (!current) return
      const chapter = current.closest<HTMLElement>('[data-chapter]')?.dataset.chapter ?? HOME_ATTRACTION_ID
      const stop = current.dataset.cityStop as ResumeEntryId
      setPosition(previous => previous.stop === stop && previous.chapter === chapter ? previous : { stop, chapter })
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    document.addEventListener('focusin', schedule)
    const story = document.getElementById('tour-story')
    const observer = new ResizeObserver(schedule)
    if (story) observer.observe(story)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('focusin', schedule)
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return position
}

export default function LifeTour() {
  const { hash } = useLocation()
  const { id } = useParams()
  const [CityExperience, setCityExperience] = useState<typeof import('./CityExperience').default>()
  const { stop, chapter } = useReadingPosition()
  const anchoredSection = useRef<HTMLElement | null>(null)
  const rememberAnchor = useCallback(() => {
    const section = document.activeElement
    if (!(section instanceof HTMLElement) || !section.matches('#tour-story, #tour-story [tabindex="-1"]')) return
    const inset = parseFloat(getComputedStyle(section).scrollMarginTop)
    if (Math.abs(section.getBoundingClientRect().top - inset) < 2) anchoredSection.current = section
  }, [])
  const hideCity = useCallback(() => {
    rememberAnchor()
    setCityExperience(undefined)
  }, [rememberAnchor])

  useEffect(() => {
    let cancelled = false
    let secondFrame = 0
    let cancelIdle = () => {}
    const loadCity = async () => {
      if (!isWebGL2Supported()) return
      try {
        const { default: Scene } = await import('./CityExperience')
        if (!cancelled) {
          rememberAnchor()
          setCityExperience(() => Scene)
        }
      } catch {
        // The story is already mounted and remains available if the chunk fails.
      }
    }
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === 'function') {
          const idle = window.requestIdleCallback(() => { void loadCity() }, { timeout: 1500 })
          cancelIdle = () => window.cancelIdleCallback(idle)
        } else {
          const timer = window.setTimeout(() => { void loadCity() }, 0)
          cancelIdle = () => window.clearTimeout(timer)
        }
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      cancelIdle()
    }
  }, [rememberAnchor])

  useLayoutEffect(() => {
    const section = anchoredSection.current
    anchoredSection.current = null
    if (section && section === document.activeElement) section.scrollIntoView()
  }, [CityExperience])

  useEffect(() => {
    const anchor = hash.slice(1) || id
    const target = anchor && (legacyAnchors.get(anchor) ?? anchor)
    const section = target && document.getElementById(target)
    if (section) {
      section.scrollIntoView()
      section.focus({ preventScroll: true })
    }
  }, [hash, id])

  return (
    <div className="life-tour" data-city={CityExperience ? true : undefined}>
      <AccessibleNav current={chapter} />
      <div className="life-layout">
        {CityExperience && (
          <aside className="life-scene" aria-hidden="true">
            <CanvasErrorBoundary onFailure={hideCity}>
              <CityExperience activeStop={stop} onFailure={hideCity} />
            </CanvasErrorBoundary>
          </aside>
        )}
        <main id="tour-story" tabIndex={-1}>
          <header className="life-intro" id="welcome-plaza" tabIndex={-1} data-city-stop="welcome-plaza" data-chapter="welcome-plaza">
            <h1>{PROFILE_NAME}</h1>
            <p className="life-positioning">{PROFILE_ROLE}</p>
            <p className="life-summary">{PROFILE_SUMMARY}</p>
            <ul className="life-contact" aria-label="Contact">
              <li>{PROFILE_LOCATION}</li>
              {CONTACT.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}
              <li className="life-print-only">{SITE_URL_LABEL}</li>
            </ul>
          </header>

          <Chapter index={0}>
            <Entry entryId="academic-hall" />
          </Chapter>
          <Chapter index={1}>
            <Entry entryId="robotics-workshop" roles={['Competition Technician', 'Electrical Control Systems Officer']} />
            <Entry entryId="makers-club" />
          </Chapter>
          <Chapter index={2}>
            <Entry entryId="robotics-workshop" anchor="robotics-leadership" roles={['Vice President']} />
            <Entry entryId="fll-center" />
          </Chapter>
          <Chapter index={3}>
            <Entry entryId="neemo-hq" />
            <Entry entryId="deca-center" />
          </Chapter>

          <footer className="life-footer">
            <h2 id="skills" tabIndex={-1}>Skills</h2>
            <ul>{PROFILE_SKILLS.map(skill => <li key={skill}>{skill}</li>)}</ul>
            <h2 id="interests" tabIndex={-1}>Interests</h2>
            <p>{INTERESTS}</p>
            <a href="#welcome-plaza" className="life-back">Back to introduction</a>
          </footer>
        </main>
      </div>
    </div>
  )
}
