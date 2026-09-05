import DownloadResumeButton from '../ui/DownloadResumeButton'

/** PRD §9 — persistent header chrome. Currently just the always-available
 * résumé download; a natural home for anything else global later. */
export default function Header() {
  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-20">
      <DownloadResumeButton />
    </div>
  )
}
