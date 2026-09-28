import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'

const SUGGESTIONS = ['API Error', 'Database Issue', 'Service Down', 'Performance Drop', 'Deployment Failure']

const SUGGESTION_TEXT: Record<string, string> = {
  'API Error': 'Production API is returning SSL certificate errors.',
  'Database Issue': 'Database connections are timing out under normal load.',
  'Service Down': 'The payment service is completely unresponsive.',
  'Performance Drop': 'API response times have doubled since this morning.',
  'Deployment Failure': 'The latest deployment failed health checks and rolled back.',
}

interface IncidentSearchProps {
  onSubmit: (text: string) => void
  disabled?: boolean
}

export default function IncidentSearch({ onSubmit, disabled }: IncidentSearchProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    const text = value.trim()
    if (!text || disabled) return
    onSubmit(text)
  }

  return (
    <div>
      <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-glow focus-within:border-cyan-accent/40 transition-colors">
        <Search size={18} className="text-white/40 ml-3 shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="What's happening? e.g. Production API is returning SSL certificate errors."
          aria-label="Describe the incident"
          disabled={disabled}
          className="flex-1 bg-transparent py-3 text-sm sm:text-base text-white placeholder:text-white/30 outline-none min-w-0"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Analyze incident"
          className="shrink-0 w-10 h-10 rounded-xl bg-cyan-accent/90 hover:bg-cyan-accent disabled:bg-white/10 disabled:text-white/30 text-charcoal-950 flex items-center justify-center transition-colors"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => setValue(SUGGESTION_TEXT[s])} disabled={disabled}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
