import Button from './Button'

export default function CityLoading() {
  return (
    <div className="absolute inset-0 z-30 grid place-content-center gap-4 bg-ground text-center">
      <p role="status">Loading the interactive city…</p>
      <Button as="link" to="/" className="justify-self-center">Back to résumé</Button>
    </div>
  )
}
