/** PRD §10 — "linked from the header/Welcome Plaza at all times ... the
 * guaranteed-works fallback if the interactive experience fails for any
 * reason." Plain anchor tag, real file, no JS required for it to work. */
export default function DownloadResumeButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="/resume-aarav-vaswani.pdf"
      download
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-[var(--color-ground)] shadow-sm hover:opacity-90 ${className}`}
    >
      ↓ Résumé (PDF)
    </a>
  )
}
