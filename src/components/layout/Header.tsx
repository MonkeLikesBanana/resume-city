import DownloadResumeButton from '../ui/DownloadResumeButton'

/** PRD §9 — persistent header chrome. Currently just the always-available
 * résumé download; a natural home for anything else global later.
 *
 * PRD v7.0 round 4 — hidden below `sm`. This bar's `bottom-4 left-4`
 * position sits inside InfoPanel's full-width mobile sheet (`inset-x-0
 * bottom-0`) at the same z-index, so it was rendering hidden underneath
 * that panel on mobile — since an attraction is essentially always active
 * once the tour is entered (§3/§8), that made the résumé download
 * effectively unreachable on mobile for the entire visit. InfoPanel now
 * carries its own inline résumé link for `sm:hidden` instead (same file
 * this button downloads, just reachable from inside the panel that was
 * covering it). Desktop is unaffected — InfoPanel is a compact right-side
 * card there, nowhere near this corner. */
export default function Header() {
  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-20 hidden sm:block">
      <DownloadResumeButton />
    </div>
  )
}
