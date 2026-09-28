import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, AlertTriangle, Database, Users, BarChart3, Settings as SettingsIcon,
  Activity, X, ActivitySquare,
} from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/memory', label: 'Memory', icon: Database },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { stats } = useIncidents()
  const openIncidents = stats.openCount

  const content = (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-cyan-accent/10 border border-cyan-accent/30 flex items-center justify-center">
            <ActivitySquare className="text-cyan-accent" size={18} />
            <motion.span
              className="absolute inset-0 rounded-xl border border-cyan-accent/40"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div>
            <div className="font-serif text-xl leading-tight text-white">Pulse</div>
            <div className="text-[11px] text-white/40 tracking-wide">Remember. Resolve. Rebuild.</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white/85 hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-cyan-accent/[0.09] border border-cyan-accent/25 shadow-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={17} className={`relative z-10 ${isActive ? 'text-cyan-accent' : ''}`} />
                <span className="relative z-10">{label}</span>
                {label === 'Incidents' && openIncidents > 0 && (
                  <span className="relative z-10 ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-magenta/20 text-magenta font-semibold">
                    {openIncidents}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-white/[0.06] mx-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet to-cyan-accent flex items-center justify-center text-xs font-semibold text-charcoal-950">
            P
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">Prasanthi</div>
            <div className="text-[11px] text-white/40">Builder</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 pt-2 text-[11px] text-cyan-soft">
          <Activity size={12} className="animate-pulseSlow" />
          System Online
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-charcoal-900/60 backdrop-blur-xl">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-64 h-full bg-charcoal-900 border-r border-white/[0.08]"
          >
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute top-5 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
            {content}
          </motion.div>
        </div>
      )}
    </>
  )
}
