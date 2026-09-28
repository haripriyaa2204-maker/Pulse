import { createContext, useContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Incident, ActivityItem, AppSettings, Resolution } from '../types'
import * as memory from '../services/memoryService'

interface IncidentsContextValue {
  incidents: Incident[]
  activity: ActivityItem[]
  settings: AppSettings
  stats: ReturnType<typeof memory.getStats>
  submitIncident: (text: string) => Incident
  resolve: (incidentId: string, resolution: Resolution) => void
  notify: (incidentId: string, owner: string) => void
  updateSettings: (partial: Partial<AppSettings>) => void
  resetApp: () => void
  clearMemory: () => void
  loadSamples: () => void
  refresh: () => void
}

const IncidentsContext = createContext<IncidentsContextValue | null>(null)

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => memory.getIncidents())
  const [activity, setActivity] = useState<ActivityItem[]>(() => memory.getActivity())
  const [settings, setSettings] = useState<AppSettings>(() => memory.getSettings())

  const refresh = useCallback(() => {
    setIncidents(memory.getIncidents())
    setActivity(memory.getActivity())
  }, [])

  const submitIncident = useCallback((text: string) => {
    const incident = memory.createIncidentFromText(text)
    setIncidents(memory.getIncidents())
    return incident
  }, [])

  const resolve = useCallback((incidentId: string, resolution: Resolution) => {
    const updated = memory.saveResolution(incidentId, resolution)
    setIncidents(updated)
    setActivity(memory.getActivity())
  }, [])

  const notify = useCallback((incidentId: string, owner: string) => {
    const updated = memory.assignOwner(incidentId, owner)
    setIncidents(updated)
  }, [])

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      memory.saveSettings(next)
      return next
    })
  }, [])

  const resetApp = useCallback(() => {
    memory.resetApplication()
    setIncidents(memory.getIncidents())
    setActivity(memory.getActivity())
    setSettings(memory.getSettings())
  }, [])

  const clearMemoryFn = useCallback(() => {
    memory.clearMemory()
    setIncidents([])
    setActivity([])
  }, [])

  const loadSamples = useCallback(() => {
    const seeded = memory.loadSampleIncidents()
    setIncidents(seeded)
    setActivity(memory.getActivity())
  }, [])

  const stats = useMemo(() => memory.getStats(incidents), [incidents])

  const value: IncidentsContextValue = {
    incidents,
    activity,
    settings,
    stats,
    submitIncident,
    resolve,
    notify,
    updateSettings,
    resetApp,
    clearMemory: clearMemoryFn,
    loadSamples,
    refresh,
  }

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>
}

export function useIncidents() {
  const ctx = useContext(IncidentsContext)
  if (!ctx) throw new Error('useIncidents must be used within an IncidentsProvider')
  return ctx
}
