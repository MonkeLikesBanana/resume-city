import { lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ResumePage from './components/layout/ResumePage'

const CityExperience = lazy(() => import('./components/layout/CityExperience'))

function CityRoute() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-md px-6 py-16">
        <p role="status">Loading the 3D portfolio…</p>
        <Link to="/" className="mt-4 inline-block underline underline-offset-2">Back to résumé</Link>
      </main>
    }>
      <CityExperience />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ResumePage />} />
      <Route path="/city" element={<CityRoute />} />
      <Route path="/plaza/:id" element={<CityRoute />} />
      <Route path="/foundry/:id" element={<CityRoute />} />
      <Route path="/lakeside/:id" element={<Navigate replace to="/#outside-work" />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
