import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Models from './pages/Models'
import Replay from './pages/Replay'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/replay" element={<Replay />} />
      </Routes>
    </Layout>
  )
}
