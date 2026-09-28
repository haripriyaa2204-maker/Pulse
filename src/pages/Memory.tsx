import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2, Users, Server, AlertTriangle, Wrench, GitBranch } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import GlassPanel from '../components/GlassPanel'
import type { MemoryNode, MemoryEdge } from '../types'

type NodeType = MemoryNode['type']

const TYPE_META: Record<NodeType, { label: string; color: string; icon: typeof Users; radius: number }> = {
  incident: { label: 'Incidents', color: '#4ee8ff', icon: AlertTriangle, radius: 230 },
  person: { label: 'People', color: '#e558c9', icon: Users, radius: 90 },
  system: { label: 'Systems', color: '#a9a6ff', icon: Server, radius: 160 },
  rootcause: { label: 'Root Causes', color: '#7c6cf0', icon: GitBranch, radius: 300 },
  fix: { label: 'Fixes', color: '#8ff2ff', icon: Wrench, radius: 360 },
}

const FILTERS: Array<{ key: NodeType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'incident', label: 'Incidents' },
  { key: 'person', label: 'People' },
  { key: 'system', label: 'Systems' },
  { key: 'rootcause', label: 'Root Causes' },
  { key: 'fix', label: 'Fixes' },
]

export default function MemoryPage() {
  const { incidents } = useIncidents()
  const [filter, setFilter] = useState<NodeType | 'all'>('all')
  const [selected, setSelected] = useState<MemoryNode | null>(null)
  const [scale, setScale] = useState(0.85)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragging = useRef<{ x: number; y: number } | null>(null)

  const { nodes, edges, positions } = useMemo(() => {
    const nodeList: MemoryNode[] = []
    const edgeList: MemoryEdge[] = []
    const people = new Set<string>()
    const systems = new Set<string>()

    incidents.forEach((incident) => {
      nodeList.push({ id: `incident:${incident.id}`, type: 'incident', label: incident.id, sub: incident.title })
      if (!systems.has(incident.system)) {
        systems.add(incident.system)
        nodeList.push({ id: `system:${incident.system}`, type: 'system', label: incident.system })
      }
      edgeList.push({ from: `incident:${incident.id}`, to: `system:${incident.system}` })

      if (!people.has(incident.owner) && incident.owner !== 'Unassigned') {
        people.add(incident.owner)
        nodeList.push({ id: `person:${incident.owner}`, type: 'person', label: incident.owner })
      }
      if (incident.owner !== 'Unassigned') {
        edgeList.push({ from: `incident:${incident.id}`, to: `person:${incident.owner}` })
      }

      if (incident.resolution) {
        const rcId = `rootcause:${incident.id}`
        const fixId = `fix:${incident.id}`
        nodeList.push({ id: rcId, type: 'rootcause', label: truncate(incident.resolution.rootCause) })
        nodeList.push({ id: fixId, type: 'fix', label: truncate(incident.resolution.fixApplied) })
        edgeList.push({ from: `incident:${incident.id}`, to: rcId })
        edgeList.push({ from: `incident:${incident.id}`, to: fixId })
      }
    })

    // Radial layout: bucket nodes by type, spread evenly around a ring per type.
    const byType: Record<NodeType, MemoryNode[]> = { incident: [], person: [], system: [], rootcause: [], fix: [] }
    nodeList.forEach((n) => byType[n.type].push(n))

    const pos = new Map<string, { x: number; y: number }>()
    ;(Object.keys(byType) as NodeType[]).forEach((type) => {
      const list = byType[type]
      const radius = TYPE_META[type].radius
      list.forEach((n, i) => {
        const angle = (i / Math.max(1, list.length)) * Math.PI * 2 + (type === 'incident' ? 0 : 0.3)
        pos.set(n.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
      })
    })

    return { nodes: nodeList, edges: edgeList, positions: pos }
  }, [incidents])

  const related = selected
    ? edges.filter((e) => e.from === selected.id || e.to === selected.id).map((e) => (e.from === selected.id ? e.to : e.from))
    : []

  function relatedTo(n: MemoryNode, sel: MemoryNode | null) {
    if (!sel) return false
    return related.includes(n.id)
  }

  const visibleNodes = filter === 'all' ? nodes : nodes.filter((n) => n.type === filter || relatedTo(n, selected))
  const visibleIds = new Set(visibleNodes.map((n) => n.id))
  const visibleEdges = edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to))

  function onPointerDown(e: ReactPointerEvent) {
    dragging.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!dragging.current) return
    setPan({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y })
  }
  function onPointerUp() {
    dragging.current = null
  }
  function onWheel(e: WheelEvent) {
    e.preventDefault()
    setScale((s) => Math.min(2, Math.max(0.4, s - e.deltaY * 0.001)))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-white">Memory Map</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`chip ${filter === f.key ? 'border-cyan-accent/50 text-cyan-soft bg-cyan-accent/[0.08]' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <GlassPanel className="lg:col-span-3 relative overflow-hidden h-[520px]">
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <IconBtn onClick={() => setScale((s) => Math.min(2, s + 0.15))} label="Zoom in"><ZoomIn size={14} /></IconBtn>
            <IconBtn onClick={() => setScale((s) => Math.max(0.4, s - 0.15))} label="Zoom out"><ZoomOut size={14} /></IconBtn>
            <IconBtn onClick={() => { setScale(0.85); setPan({ x: 0, y: 0 }) }} label="Reset view"><Maximize2 size={14} /></IconBtn>
          </div>

          <div
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          >
            <svg viewBox="-400 -340 800 680" className="w-full h-full" role="img" aria-label="Organizational memory graph">
              <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
                {visibleEdges.map((e, i) => {
                  const a = positions.get(e.from)
                  const b = positions.get(e.to)
                  if (!a || !b) return null
                  const isSelectedEdge = selected && (e.from === selected.id || e.to === selected.id)
                  return (
                    <line
                      key={i}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={isSelectedEdge ? '#4ee8ff' : 'rgba(255,255,255,0.08)'}
                      strokeWidth={isSelectedEdge ? 1.4 : 0.8}
                    />
                  )
                })}
                {visibleNodes.map((n) => {
                  const p = positions.get(n.id)
                  if (!p) return null
                  const meta = TYPE_META[n.type]
                  const isSelected = selected?.id === n.id
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${p.x} ${p.y})`}
                      onClick={() => setSelected(n)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={isSelected ? 9 : 6}
                        fill={meta.color}
                        fillOpacity={isSelected ? 0.9 : 0.7}
                        stroke={isSelected ? '#fff' : 'transparent'}
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={n.type === 'incident' ? -12 : 14}
                        textAnchor="middle"
                        fontSize={9}
                        fill="rgba(255,255,255,0.55)"
                      >
                        {n.label.length > 18 ? n.label.slice(0, 17) + '…' : n.label}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="text-xs text-white/40 mb-3">Node Details</h3>
          {selected ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selected.id}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: TYPE_META[selected.type].color }}
                />
                <span className="text-xs text-white/40 capitalize">{TYPE_META[selected.type].label.replace(/s$/, '')}</span>
              </div>
              <div className="text-sm text-white/90 font-medium mb-1">{selected.label}</div>
              {selected.sub && <div className="text-xs text-white/50 mb-3">{selected.sub}</div>}
              <div className="text-xs text-white/40 mb-2">Connected ({related.length})</div>
              <div className="space-y-1.5">
                {nodes
                  .filter((n) => related.includes(n.id))
                  .slice(0, 8)
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSelected(n)}
                      className="w-full text-left text-xs text-white/60 hover:text-white/90 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors truncate"
                    >
                      {n.label}
                    </button>
                  ))}
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-white/40">Click a node to explore its connections. Drag to pan, scroll to zoom.</p>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}

function truncate(text: string, len = 26) {
  return text.length > len ? text.slice(0, len - 1) + '…' : text
}

function IconBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:border-cyan-accent/40 transition-colors"
    >
      {children}
    </button>
  )
}
