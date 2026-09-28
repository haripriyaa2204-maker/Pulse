import type {
  Incident,
  SimilarIncidentMatch,
  OwnerCandidate,
  Resolution,
  ActivityItem,
  AppSettings,
} from '../types'
import { SEED_INCIDENTS } from '../data/incidents'

const INCIDENTS_KEY = 'pulse:incidents'
const ACTIVITY_KEY = 'pulse:activity'
const SETTINGS_KEY = 'pulse:settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  autoRouting: true,
  aiConfidenceThreshold: 60,
}

// ---------------------------------------------------------------------------
// Low-level persistence helpers. Wrapped in try/catch per spec: invalid or
// missing localStorage must never crash the app.
// ---------------------------------------------------------------------------

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable (quota, private mode, etc). Fail silently —
    // the in-memory app state still works for the session.
  }
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export function getIncidents(): Incident[] {
  const existing = safeRead<Incident[] | null>(INCIDENTS_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) return existing
  safeWrite(INCIDENTS_KEY, SEED_INCIDENTS)
  return SEED_INCIDENTS
}

export function saveIncidents(incidents: Incident[]): void {
  safeWrite(INCIDENTS_KEY, incidents)
}

function nextIncidentId(incidents: Incident[]): string {
  const max = incidents.reduce((acc, inc) => {
    const num = parseInt(inc.id.replace('INC-', ''), 10)
    return Number.isFinite(num) && num > acc ? num : acc
  }, 0)
  return `INC-${String(max + 1).padStart(3, '0')}`
}

function guessSystem(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('ssl') || t.includes('certificate') || t.includes('payment') || t.includes('checkout')) return 'Payment API'
  if (t.includes('database') || t.includes('db ') || t.includes('replica') || t.includes('query')) return 'Database'
  if (t.includes('auth') || t.includes('login') || t.includes('token')) return 'Authentication'
  if (t.includes('deploy') || t.includes('rollout') || t.includes('pipeline') || t.includes('ci/cd')) return 'CI/CD'
  if (t.includes('cpu') || t.includes('memory') || t.includes('performance') || t.includes('latency')) return 'Compute'
  if (t.includes('notification') || t.includes('push')) return 'Notifications'
  if (t.includes('search') || t.includes('index')) return 'Search'
  if (t.includes('cdn') || t.includes('cache') || t.includes('asset')) return 'Frontend Delivery'
  return 'Production API'
}

function guessPriority(text: string): Incident['priority'] {
  const t = text.toLowerCase()
  if (t.includes('down') || t.includes('outage') || t.includes('critical') || t.includes('payment')) return 'critical'
  if (t.includes('error') || t.includes('fail') || t.includes('ssl')) return 'high'
  if (t.includes('slow') || t.includes('drop') || t.includes('delay')) return 'medium'
  return 'medium'
}

/**
 * Creates a brand-new incident from free-text input and persists it.
 * This is the entry point of the "NEW INCIDENT" stage of the Pulse flow.
 */
export function createIncidentFromText(description: string, reportedBy = 'You'): Incident {
  const incidents = getIncidents()
  const id = nextIncidentId(incidents)
  const incident: Incident = {
    id,
    title: description.length > 64 ? description.slice(0, 61) + '…' : description,
    description,
    system: guessSystem(description),
    status: 'investigating',
    priority: guessPriority(description),
    owner: 'Unassigned',
    reportedBy,
    createdAt: new Date().toISOString(),
  }
  saveIncidents([incident, ...incidents])
  return incident
}

// ---------------------------------------------------------------------------
// Memory search — keyword + system based similarity scoring.
// Kept isolated so the real Hindsight vector-search backend can be swapped
// in later without touching any UI component.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'for',
  'and', 'or', 'with', 'at', 'by', 'from', 'this', 'that', 'it', 'its', 'be',
  'has', 'have', 'had', 'returning', 'returns',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

/**
 * searchMemory — the high-level entry point Pulse calls when a new incident
 * comes in. Wraps findSimilarIncidents with a small artificial delay so the
 * UI can show its investigation sequence; a real backend call would replace
 * the delay with an actual network round-trip.
 */
export async function searchMemory(incident: Incident): Promise<SimilarIncidentMatch[]> {
  await new Promise((r) => setTimeout(r, 300))
  return findSimilarIncidents(incident)
}

export function findSimilarIncidents(incident: Incident, limit = 4): SimilarIncidentMatch[] {
  const all = getIncidents().filter((i) => i.id !== incident.id && i.status === 'resolved')
  const queryTokens = new Set(tokenize(`${incident.title} ${incident.description}`))

  const scored = all.map((candidate) => {
    const candTokens = new Set(tokenize(`${candidate.title} ${candidate.description}`))
    const shared = [...queryTokens].filter((t) => candTokens.has(t))
    const union = new Set([...queryTokens, ...candTokens])
    let score = union.size > 0 ? shared.length / union.size : 0

    const reasons: string[] = []
    if (candidate.system === incident.system) {
      score += 0.28
      reasons.push('Same service')
    }
    if (shared.length > 0) {
      reasons.push('Similar error signature')
    }
    if (candidate.priority === incident.priority) {
      score += 0.05
      reasons.push('Similar failure pattern')
    }
    if (candidate.resolution) {
      reasons.push('Similar resolution history')
    }

    const matchPercent = Math.max(4, Math.min(97, Math.round(score * 100)))
    return { incident: candidate, matchPercent, reasons: reasons.length ? reasons : ['Related keywords'] }
  })

  return scored
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit)
    .filter((m) => m.matchPercent > 15)
}

/**
 * findLikelyOwner — infers who is *currently* most likely to own an
 * incoming incident, based on who most recently resolved similar ones.
 * Ownership is always framed probabilistically — Pulse never claims
 * certainty here.
 */
export function findLikelyOwner(matches: SimilarIncidentMatch[]): OwnerCandidate | null {
  const resolved = matches
    .filter((m) => m.incident.resolution)
    .sort((a, b) => {
      const dateA = new Date(a.incident.resolution!.resolvedOn).getTime()
      const dateB = new Date(b.incident.resolution!.resolvedOn).getTime()
      // Weight recency heavily, but blend in match strength.
      return (dateB + b.matchPercent * 8.64e7) - (dateA + a.matchPercent * 8.64e7)
    })

  if (resolved.length === 0) return null

  const top = resolved[0]
  const owner = top.incident.resolution!.resolvedBy
  const recentCount = resolved.filter((m) => m.incident.resolution!.resolvedBy === owner).length
  const confidence = Math.min(96, Math.round(top.matchPercent * 0.7 + recentCount * 8))

  const roleMap: Record<string, string> = {
    'Engineer A': 'Senior Backend Engineer',
    'Engineer B': 'Backend Engineer',
    'Engineer C': 'Site Reliability Engineer',
  }

  return {
    name: owner,
    role: roleMap[owner] ?? 'Engineer',
    confidence,
    explanation:
      `${owner} resolved the most similar recent incident` +
      (recentCount > 1 ? ` and ${recentCount - 1} other related case${recentCount > 2 ? 's' : ''}` : '') +
      '. High availability during similar events.',
    avatarSeed: owner.slice(-1),
  }
}

// ---------------------------------------------------------------------------
// Resolution + memory retention
// ---------------------------------------------------------------------------

export function saveResolution(incidentId: string, resolution: Resolution): Incident[] {
  const incidents = getIncidents()
  const updated = incidents.map((inc) =>
    inc.id === incidentId
      ? { ...inc, status: 'resolved' as const, owner: resolution.resolvedBy, resolution }
      : inc
  )
  saveIncidents(updated)
  const incident = updated.find((i) => i.id === incidentId)
  if (incident) {
    addActivity({
      id: `act-${Date.now()}`,
      incidentId: incident.id,
      title: incident.title,
      status: 'resolved',
      timestamp: new Date().toISOString(),
    })
  }
  return updated
}

/**
 * retainMemory — explicit "teach Pulse" step. In this local implementation
 * saveResolution already persists the new memory; retainMemory exists as a
 * distinct, isolated call so a real backend can treat ingestion as its own
 * operation (e.g. embedding + indexing) without changing callers.
 */
export function retainMemory(incident: Incident): void {
  // No-op locally beyond what saveResolution already persisted — kept as a
  // separate named entry point per the required service-layer contract.
  void incident
}

export function assignOwner(incidentId: string, owner: string): Incident[] {
  const incidents = getIncidents().map((inc) =>
    inc.id === incidentId ? { ...inc, owner, status: 'investigating' as const } : inc
  )
  saveIncidents(incidents)
  return incidents
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export function getActivity(): ActivityItem[] {
  const existing = safeRead<ActivityItem[] | null>(ACTIVITY_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) return existing
  const seeded = SEED_INCIDENTS.filter((i) => i.resolution || i.status !== 'resolved')
    .slice(-6)
    .reverse()
    .map((i) => ({
      id: `act-seed-${i.id}`,
      incidentId: i.id,
      title: i.title,
      status: i.status,
      timestamp: i.resolution?.resolvedOn ?? i.createdAt,
    }))
  safeWrite(ACTIVITY_KEY, seeded)
  return seeded
}

export function addActivity(item: ActivityItem): ActivityItem[] {
  const current = getActivity()
  const next = [item, ...current].slice(0, 20)
  safeWrite(ACTIVITY_KEY, next)
  return next
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings(): AppSettings {
  return safeRead<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  safeWrite(SETTINGS_KEY, settings)
}

// ---------------------------------------------------------------------------
// Demo data controls (Settings page)
// ---------------------------------------------------------------------------

export function resetApplication(): void {
  try {
    localStorage.removeItem(INCIDENTS_KEY)
    localStorage.removeItem(ACTIVITY_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    // ignore
  }
}

export function clearMemory(): void {
  safeWrite(INCIDENTS_KEY, [])
  safeWrite(ACTIVITY_KEY, [])
}

export function loadSampleIncidents(): Incident[] {
  saveIncidents(SEED_INCIDENTS)
  return SEED_INCIDENTS
}

// ---------------------------------------------------------------------------
// Derived stats
// ---------------------------------------------------------------------------

export function getStats(incidents: Incident[]) {
  const totalIncidents = incidents.length
  const uniqueSystems = new Set(incidents.map((i) => i.system)).size
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length
  const openCount = incidents.filter((i) => i.status !== 'resolved').length
  return { totalIncidents, uniqueSystems, resolvedCount, openCount }
}
