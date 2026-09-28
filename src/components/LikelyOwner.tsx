import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'
import type { OwnerCandidate } from '../types'

interface LikelyOwnerProps {
  owner: OwnerCandidate | null
  onNotify?: () => void
}

type NotifyState = 'idle' | 'sending' | 'sent'

export default function LikelyOwner({ owner, onNotify }: LikelyOwnerProps) {
  const [state, setState] = useState<NotifyState>('idle')

  if (!owner) {
    return <p className="text-sm text-white/40">Not enough resolution history to infer a likely owner yet.</p>
  }

  function handleNotify() {
    setState('sending')
    setTimeout(() => {
      setState('sent')
      onNotify?.()
    }, 900)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet to-cyan-accent flex items-center justify-center text-sm font-semibold text-charcoal-950">
          {owner.avatarSeed}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">{owner.name}</div>
          <div className="text-xs text-white/40">{owner.role}</div>
        </div>
        <div className="shrink-0 text-xs font-semibold text-lavender-soft bg-lavender/10 border border-lavender/30 rounded-full px-2.5 py-1">
          {owner.confidence}% confidence
        </div>
      </div>

      <p className="text-sm text-white/60 leading-relaxed mb-4">{owner.explanation}</p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleNotify}
        disabled={state !== 'idle'}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-cyan-accent/90 hover:bg-cyan-accent disabled:bg-white/10 text-charcoal-950 disabled:text-white/60 transition-colors"
      >
        {state === 'idle' && (
          <>
            <Send size={14} /> Notify {owner.name}
          </>
        )}
        {state === 'sending' && (
          <>
            <Loader2 size={14} className="animate-spin" /> Sending...
          </>
        )}
        {state === 'sent' && (
          <>
            <CheckCircle2 size={14} /> Incident routed ✓
          </>
        )}
      </motion.button>
    </div>
  )
}
