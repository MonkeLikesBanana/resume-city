import DownloadResumeButton from '../ui/DownloadResumeButton'

/** Keep the PDF available on desktop. The mobile tour puts the same link inside the sheet. */
export default function Header() {
  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-20 hidden sm:block">
      <DownloadResumeButton />
    </div>
  )
}
