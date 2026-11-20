import { useEffect, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CONTACT, OUTSIDE_WORK, PROFILE_LOCATION, PROFILE_NAME, PROFILE_ROLE, PROFILE_SKILLS } from '../../content/profile'
import { EDUCATION_ID, EXPERIENCE_IDS, RESUME_ENTRIES, type ResumeEntry, type ResumeEntryId } from '../../content/resume'
import '../../styles/resume.css'

function Entry({ id }: { id: ResumeEntryId }) {
  const entry: ResumeEntry = RESUME_ENTRIES[id]

  return (
    <article className="resume-entry" id={id} tabIndex={-1}>
      <h3>{entry.name}</h3>
      {entry.timeline ? (
        <ul className="resume-roles">
          {entry.timeline.map(({ role, dateRange, description }) => (
            <li key={role}>
              <div className="resume-role-heading">
                <h4>{role}</h4>
                <p>{dateRange}</p>
              </div>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="resume-subtitle">{entry.subtitle}</p>
      )}
      {entry.description && <p className="resume-description">{entry.description}</p>}
      {entry.facts && (
        <ul className="resume-education-facts">
          {entry.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      )}
    </article>
  )
}

export default function ResumePage({ fallbackNav }: { fallbackNav?: ReactNode }) {
  const { hash } = useLocation()
  const { id } = useParams()

  useEffect(() => {
    if (!fallbackNav) document.title = `${PROFILE_NAME} — Résumé`
    const target = hash.slice(1) || (fallbackNav ? id : undefined)
    if (target) document.getElementById(target)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [fallbackNav, hash, id])

  return (
    <main className="resume-page">
      <div className="resume-document">
        <header className="resume-header" id="welcome-plaza">
          <h1>{PROFILE_NAME}</h1>
          <p className="resume-positioning">{PROFILE_ROLE}</p>
          <ul className="resume-contact" aria-label="Contact and résumé">
            {CONTACT.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}
            <li>{PROFILE_LOCATION}</li>
            <li className="resume-screen-only"><a href="/resume-aarav-vaswani.pdf" download>Résumé PDF <span aria-hidden="true">↓</span></a></li>
          </ul>
          {fallbackNav ? (
            <div className="resume-portfolio resume-screen-only">
              <p>Showing the text version.</p>
              <p className="mt-3 max-w-prose">{RESUME_ENTRIES['welcome-plaza'].description}</p>
              {fallbackNav}
            </div>
          ) : (
            <p className="resume-portfolio resume-screen-only">
              <Link to="/city">Explore the 3D portfolio <span aria-hidden="true">↗</span></Link>
            </p>
          )}
        </header>

        <section className="resume-section" aria-labelledby="experience">
          <h2 id="experience">Experience</h2>
          <div>{EXPERIENCE_IDS.map((entryId) => <Entry key={entryId} id={entryId} />)}</div>
        </section>

        <section className="resume-section" aria-labelledby="education">
          <h2 id="education">Education</h2>
          <Entry id={EDUCATION_ID} />
        </section>

        <section className="resume-section" aria-labelledby="skills">
          <h2 id="skills">Skills</h2>
          <ul className="resume-skills">
            {PROFILE_SKILLS.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </section>

        <section className="resume-section" aria-labelledby="outside-work">
          <h2 id="outside-work">Outside work</h2>
          <p>{OUTSIDE_WORK}</p>
        </section>
      </div>
    </main>
  )
}
