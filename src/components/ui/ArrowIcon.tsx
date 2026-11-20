export default function ArrowIcon({ direction }: { direction: 'left' | 'right' | 'download' }) {
  const paths = {
    left: 'M13 8H3m0 0 4-4M3 8l4 4',
    right: 'M3 8h10m0 0-4-4m4 4-4 4',
    download: 'M8 2v8m0 0 3-3m-3 3L5 7M3 13h10',
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="inline-block size-4 align-text-bottom" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[direction]} />
    </svg>
  )
}
