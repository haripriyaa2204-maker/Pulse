import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ToastStack from './components/Toast'
import Home from './pages/Home'
import Incidents from './pages/Incidents'
import MemoryPage from './pages/Memory'
import Team from './pages/Team'
import Analytics from './pages/Analytics'
import SettingsPage from './pages/Settings'

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-charcoal-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-charcoal-950/80 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-lg text-white">Pulse</span>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <ToastStack />
    </div>
  )
}
