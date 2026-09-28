export type IncidentStatus = 'open' | 'investigating' | 'resolved'
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Resolution {
  rootCause: string
  fixApplied: string
  resolvedBy: string
  resolvedOn: string
  peopleInvolved?: string[]
  tags?: string[]
}

export interface Incident {
  id: string
  title: string
  description: string
  system: string
  status: IncidentStatus
  priority: IncidentPriority
  owner: string
  reportedBy: string
  createdAt: string
  resolution?: Resolution
}

export interface SimilarIncidentMatch {
  incident: Incident
  matchPercent: number
  reasons: string[]
}

export interface OwnerCandidate {
  name: string
  role: string
  confidence: number
  explanation: string
  avatarSeed: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  systems: string[]
  resolvedCount: number
  recentResolution: string
  avatarSeed: string
}

export interface ActivityItem {
  id: string
  incidentId: string
  title: string
  status: IncidentStatus
  timestamp: string
}

export interface AppSettings {
  theme: 'dark' | 'midnight'
  notificationsEnabled: boolean
  autoRouting: boolean
  aiConfidenceThreshold: number
}

export interface MemoryNode {
  id: string
  type: 'incident' | 'person' | 'system' | 'rootcause' | 'fix'
  label: string
  sub?: string
}

export interface MemoryEdge {
  from: string
  to: string
}
