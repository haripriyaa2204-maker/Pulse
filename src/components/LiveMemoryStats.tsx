import { CalendarDays, Layers, Users2, BrainCircuit } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

interface LiveMemoryStatsProps {
  totalIncidents: number
  uniqueSystems: number
  teamMembers: number
}

export default function LiveMemoryStats({ totalIncidents, uniqueSystems, teamMembers }: LiveMemoryStatsProps) {
  const items = [
    { icon: CalendarDays, value: totalIncidents, label: 'Total Incidents' },
    { icon: Layers, value: uniqueSystems, label: 'Unique Systems' },
    { icon: Users2, value: teamMembers, label: 'Team Members' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 glass rounded-xl px-4 py-2.5"
        >
          <Icon size={16} className="text-white/40" />
          <div>
            <div className="text-base font-semibold text-white leading-none">
              <AnimatedCounter value={value} />
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-full px-3.5 py-2 border border-cyan-accent/30 bg-cyan-accent/[0.08] text-cyan-accent text-xs font-medium ml-auto">
        <BrainCircuit size={14} className="animate-pulseSlow" />
        Live Memory
      </div>
    </div>
  )
}
