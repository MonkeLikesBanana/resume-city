import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CONTACT,
  INTERESTS,
  PROFILE_LOCATION,
  PROFILE_NAME,
  PROFILE_ROLE,
  PROFILE_SKILLS,
  PROFILE_SUMMARY,
  SITE_URL_LABEL,
} from '../../content/profile'
import { EDUCATION_ID, EXPERIENCE_IDS, RESUME_ENTRIES, type ResumeEntry, type ResumeEntryId } from '../../content/resume'
import '../../styles/resume.css'

/** Router state set by NoWebGLFallback when the 3D city can't run on this device. */
export interface ResumeLocationState {
  cityUnavailable?: boolean
}

function Entry({ id }: { id: ResumeEntryId }) {
  const entry: ResumeEntry = RESUME_ENTRIES[id]

  return (
    <article className="resume-entry" id={id} tabIndex={-1}>
      <h3>{entry.name}</h3>
      {entry.timeline && (
        <ul className="resume-roles">
          {entry.timeline.map(({ role, dateRange, description }) => (
            <li key={role}>
              <div className="resume-role-heading">
                <h4>{role}</h4>
                <p>{dateRange}</p>
              </div>
              {description && <p>{description}</p>}
            </li>
          ))}
        </ul>
      )}
      {entry.facts && (
        <ul className="resume-education-facts">
          {entry.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      )}
    </article>
  )
}

export default function ResumePage() {
  const { hash, state } = useLocation()
  const cityUnavailable = (state as ResumeLocationState | null)?.cityUnavailable === true

  useEffect(() => {
    document.title = `${PROFILE_NAME} — Résumé`
    const target = hash === '#outside-work' ? 'interests' : hash.slice(1)
    const section = target ? document.getElementById(target) : null
    if (section) {
      section.scrollIntoView()
      if (cityUnavailable) section.focus({ preventScroll: true })
    } else window.scrollTo(0, 0)
  }, [cityUnavailable, hash])

  return (
    <main className="resume-page">
      <div className="resume-document">
        <header className="resume-header" id="welcome-plaza">
          {cityUnavailable && (
            <p className="resume-notice resume-screen-only" role="status">
              Showing the résumé because the 3D city is unavailable.
            </p>
          )}
          <h1>{PROFILE_NAME}</h1>
          <p className="resume-positioning">{PROFILE_ROLE}</p>
          <p className="resume-summary">{PROFILE_SUMMARY}</p>
          <ul className="resume-contact" aria-label="Contact">
            {CONTACT.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}
            <li>{PROFILE_LOCATION}</li>
            <li className="resume-print-only">{SITE_URL_LABEL}</li>
            <li className="resume-screen-only"><a href="/resume-aarav-vaswani.pdf" download>Download PDF</a></li>
          </ul>
        </header>

        <section className="resume-section" aria-labelledby="education">
          <h2 id="education">Education</h2>
          <Entry id={EDUCATION_ID} />
        </section>

        <section className="resume-section" aria-labelledby="experience">
          <h2 id="experience">Experience</h2>
          <div>{EXPERIENCE_IDS.map((entryId) => <Entry key={entryId} id={entryId} />)}</div>
        </section>

        <section className="resume-section" aria-labelledby="skills">
          <h2 id="skills">Skills</h2>
          <ul className="resume-skills">
            {PROFILE_SKILLS.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </section>

        <section className="resume-section" aria-labelledby="interests">
          <h2 id="interests">Interests</h2>
          <p>{INTERESTS}</p>
        </section>

        {!cityUnavailable && (
          <footer className="resume-footer resume-screen-only">
            <Link to="/city">View as an interactive 3D city</Link>
          </footer>
        )}
      </div>
    </main>
  )
}
