import ArrowIcon from './ArrowIcon'
import Button from './Button'

export default function DownloadResumeButton({ label = 'Résumé (PDF)', className }: { label?: string; className?: string }) {
  return (
    <Button as="a" href="/resume-aarav-vaswani.pdf" download className={className}>
      <ArrowIcon direction="download" /> {label}
    </Button>
  )
}
