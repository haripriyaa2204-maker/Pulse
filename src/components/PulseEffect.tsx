import { Brain, SearchCheck, UserCheck, Send, GraduationCap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const STAGES = [
  { label: 'Remember', icon: Brain },
  { label: 'Find similar issues', icon: SearchCheck },
  { label: 'Identify likely owner', icon: UserCheck },
  { label: 'Route & notify', icon: Send },
  { label: 'Resolve & teach', icon: GraduationCap },
  { label: 'Get smarter', icon: TrendingUp },
]

interface PulseEffectProps {
  activeStage?: number
}

export default function PulseEffect({ activeStage = -1 }: PulseEffectProps) {
  return (
    <div>
      <h3 className="font-serif text-base text-white mb-4">The Pulse Effect</h3>
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {STAGES.map(({ label, icon: Icon }, i) => (
          <div key={label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5 w-[84px] sm:w-[96px] text-center">
              <div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                  i === activeStage
                    ? 'bg-cyan-accent/15 border-cyan-accent text-cyan-accent'
                    : i < activeStage
                    ? 'bg-cyan-accent/5 border-cyan-accent/30 text-cyan-soft'
                    : 'bg-white/[0.03] border-white/10 text-white/40'
                }`}
              >
                {i === activeStage && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-cyan-accent"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <Icon size={15} />
              </div>
              <span className="text-[11px] leading-tight text-white/50">{label}</span>
            </div>
            {i < STAGES.length - 1 && <div className="w-4 sm:w-6 h-px bg-white/10 mx-0.5" />}
          </div>
        ))}
      </div>
    </div>
  )
}
