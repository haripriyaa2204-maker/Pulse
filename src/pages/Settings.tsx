import { useState } from 'react'
import { Moon, MoonStar, Bell, BrainCircuit, Sliders, Database, RotateCcw, Trash2, Upload } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import { useToast } from '../hooks/useToast'
import GlassPanel from '../components/GlassPanel'

export default function SettingsPage() {
  const { settings, updateSettings, resetApp, clearMemory, loadSamples, stats } = useIncidents()
  const { push } = useToast()
  const [confirming, setConfirming] = useState<'reset' | 'clear' | null>(null)

  function handleReset() {
    resetApp()
    push('Application reset to defaults.', 'info')
    setConfirming(null)
  }

  function handleClear() {
    clearMemory()
    push('Demo memory cleared.', 'error')
    setConfirming(null)
  }

  function handleLoadSamples() {
    loadSamples()
    push('Sample incidents loaded ✓', 'success')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="font-serif text-2xl text-white">Settings</h1>

      <GlassPanel className="p-5">
        <SectionHeader icon={Moon} title="Appearance" />
        <div className="flex gap-3">
          {(['dark', 'midnight'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ theme })}
              className={`flex-1 flex items-center gap-2 justify-center rounded-xl py-2.5 text-sm border transition-colors capitalize ${
                settings.theme === theme
                  ? 'border-cyan-accent/50 bg-cyan-accent/[0.08] text-cyan-soft'
                  : 'border-white/10 text-white/50 hover:border-white/25'
              }`}
            >
              <MoonStar size={14} /> {theme}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-2">Midnight deepens the background and reduces glow intensity.</p>
      </GlassPanel>

      <GlassPanel className="p-5">
        <SectionHeader icon={Bell} title="Notifications" />
        <Toggle
          label="Enable owner notifications"
          description="Send a routing notification when an owner is identified."
          checked={settings.notificationsEnabled}
          onChange={(v) => updateSettings({ notificationsEnabled: v })}
        />
      </GlassPanel>

      <GlassPanel className="p-5">
        <SectionHeader icon={BrainCircuit} title="Memory" />
        <p className="text-sm text-white/50 mb-4">
          Pulse currently holds <span className="text-white/80 font-medium">{stats.totalIncidents}</span> incidents
          across <span className="text-white/80 font-medium">{stats.uniqueSystems}</span> systems.
        </p>
        <Toggle
          label="Auto-route to likely owner"
          description="Automatically suggest routing as soon as a confident match is found."
          checked={settings.autoRouting}
          onChange={(v) => updateSettings({ autoRouting: v })}
        />
      </GlassPanel>

      <GlassPanel className="p-5">
        <SectionHeader icon={Sliders} title="AI Behavior" />
        <label className="text-sm text-white/70 block mb-2" htmlFor="confidence-threshold">
          Minimum confidence before suggesting an owner: <span className="text-cyan-accent font-medium">{settings.aiConfidenceThreshold}%</span>
        </label>
        <input
          id="confidence-threshold"
          type="range"
          min={30}
          max={95}
          step={5}
          value={settings.aiConfidenceThreshold}
          onChange={(e) => updateSettings({ aiConfidenceThreshold: Number(e.target.value) })}
          className="w-full accent-cyan-accent"
        />
      </GlassPanel>

      <GlassPanel className="p-5">
        <SectionHeader icon={Database} title="Demo Data" />
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={handleLoadSamples}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm border border-white/10 hover:border-cyan-accent/40 text-white/70 hover:text-cyan-soft transition-colors"
          >
            <Upload size={14} /> Load sample incidents
          </button>
          <button
            onClick={() => setConfirming('clear')}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm border border-magenta/30 hover:bg-magenta/10 text-magenta transition-colors"
          >
            <Trash2 size={14} /> Clear demo memory
          </button>
          <button
            onClick={() => setConfirming('reset')}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm border border-white/10 hover:border-white/25 text-white/70 transition-colors"
          >
            <RotateCcw size={14} /> Reset application
          </button>
        </div>

        {confirming && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-white/70 mb-3">
              {confirming === 'reset'
                ? 'This restores Pulse to its original seeded demo state. Continue?'
                : 'This clears all incidents and activity from local memory. Continue?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirming === 'reset' ? handleReset : handleClear}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-magenta/90 hover:bg-magenta text-charcoal-950"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setConfirming(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Moon; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} className="text-cyan-accent" />
      <h3 className="font-serif text-base text-white">{title}</h3>
    </div>
  )
}

function Toggle({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-white/80">{label}</div>
        <div className="text-xs text-white/35">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-cyan-accent/70' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
