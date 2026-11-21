import { Navigate, Route, Routes } from 'react-router-dom'
import LifeTour from './components/layout/LifeTour'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LifeTour />} />
      <Route path="/city" element={<LifeTour />} />
      <Route path="/plaza/:id" element={<LifeTour />} />
      <Route path="/foundry/:id" element={<LifeTour />} />
      <Route path="/lakeside/:id" element={<Navigate replace to="/#interests" />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
