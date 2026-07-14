import { Routes, Route } from 'react-router'
import AnalyticsLayout from './components/AnalyticsLayout'
import CasesLayout from './components/CasesLayout'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Models from './pages/Models'
import Replay from './pages/Replay'
import CaseFile from './pages/CaseFile'
import Scanner from './pages/Scanner'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/analytics/*" element={
        <AnalyticsLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="models" element={<Models />} />
            <Route path="replay" element={<Replay />} />
            <Route path="scanner" element={<Scanner />} />
          </Routes>
        </AnalyticsLayout>
      } />
      <Route path="/cases/*" element={
        <CasesLayout>
          <Routes>
            <Route path=":id" element={<CaseFile />} />
          </Routes>
        </CasesLayout>
      } />
    </Routes>
  )
}
