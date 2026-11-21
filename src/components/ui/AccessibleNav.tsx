import { TOUR_CHAPTERS } from '../../content/tour'
import { HOME_ATTRACTION_ID } from '../../config'

export default function AccessibleNav({ current }: { current: string }) {
  return (
    <header className="life-navigation">
      <a className="life-skip" href="#tour-story">Skip to story</a>
      <nav aria-label="Chapters">
        <a href={`#${HOME_ATTRACTION_ID}`} aria-current={current === HOME_ATTRACTION_ID ? 'location' : undefined}>Intro</a>
        {TOUR_CHAPTERS.map(chapter => (
          <a key={chapter.id} href={`#${chapter.id}`} aria-current={current === chapter.id ? 'location' : undefined}>{chapter.label}</a>
        ))}
      </nav>
      <a className="life-pdf" href="/resume-aarav-vaswani.pdf" download>Résumé PDF</a>
    </header>
  )
}
