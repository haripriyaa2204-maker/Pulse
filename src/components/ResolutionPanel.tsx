import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, BrainCircuit } from 'lucide-react'
import type { Resolution } from '../types'

interface ResolutionPanelProps {
  onResolve: (resolution: Resolution) => void
  resolvedBy?: string
}

type SaveState = 'idle' | 'saving' | 'done'

const TAG_OPTIONS = ['Root cause', 'Fix applied', 'People involved', 'Tags']

export default function ResolutionPanel({ onResolve, resolvedBy = 'You' }: ResolutionPanelProps) {
  const [note, setNote] = useState('')
  const [checked, setChecked] = useState<string[]>(['Root cause', 'Fix applied'])
  const [state, setState] = useState<SaveState>('idle')

  function toggle(tag: string) {
    setChecked((c) => (c.includes(tag) ? c.filter((t) => t !== tag) : [...c, tag]))
  }

  function handleSubmit() {
    if (!note.trim() || state !== 'idle') return
    setState('saving')
    setTimeout(() => {
      onResolve({
        rootCause: checked.includes('Root cause') ? note.trim() : 'Not specified',
        fixApplied: note.trim(),
        resolvedBy,
        resolvedOn: new Date().toISOString(),
        tags: checked,
      })
      setState('done')
    }, 900)
  }

  if (state === 'done') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-12 h-12 mx-auto rounded-full bg-cyan-accent/10 border border-cyan-accent/40 flex items-center justify-center mb-3"
        >
          <BrainCircuit size={20} className="text-cyan-accent" />
        </motion.div>
        <div className="text-sm font-medium text-white mb-1">Memory Updated ✓</div>
        <div className="text-xs text-white/40">Pulse learned something new.</div>
      </motion.div>
    )
  }

  return (
    <div>
      <label className="text-sm text-white/70 block mb-2" htmlFor="resolution-note">
        How was this resolved?
      </label>
      <textarea
        id="resolution-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Renewed the SSL certificate and restarted the API service."
        rows={3}
        className="w-full rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-accent/40 outline-none px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 resize-none mb-3"
      />

      <div className="text-xs text-white/40 mb-2">Add to Memory</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {TAG_OPTIONS.map((tag) => (
          <label
            key={tag}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              checked.includes(tag)
                ? 'border-cyan-accent/40 bg-cyan-accent/10 text-cyan-soft'
                : 'border-white/10 text-white/50 hover:border-white/25'
            }`}
          >
            <input
              type="checkbox"
              checked={checked.includes(tag)}
              onChange={() => toggle(tag)}
              className="sr-only"
            />
            {tag}
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!note.trim() || state !== 'idle'}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-lavender/90 hover:bg-lavender disabled:bg-white/10 text-charcoal-950 disabled:text-white/40 transition-colors"
      >
        {state === 'saving' ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Resolving...
          </>
        ) : (
          <>
            <CheckCircle2 size={14} /> Mark as Resolved
          </>
        )}
      </button>
    </div>
  )
}
