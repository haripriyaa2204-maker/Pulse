import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useMemo } from 'react'

interface MemoryGrowthChartProps {
  totalIncidents: number
}

export default function MemoryGrowthChart({ totalIncidents }: MemoryGrowthChartProps) {
  const data = useMemo(() => {
    const buckets = [
      { range: '1–3', base: 40 },
      { range: '4–7', base: 58 },
      { range: '8–11', base: 73 },
      { range: '12–15', base: 85 },
      { range: '16+', base: 92 },
    ]
    // Scale the final bucket slightly with how much memory currently exists,
    // so the chart visibly reflects growth as incidents are resolved.
    const bonus = Math.min(6, Math.max(0, totalIncidents - 15))
    return buckets.map((b, i) =>
      i === buckets.length - 1 ? { ...b, value: Math.min(97, b.base + bonus) } : { ...b, value: b.base }
    )
  }, [totalIncidents])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-serif text-base text-white">Memory Growth</h3>
      </div>
      <p className="text-xs text-white/40 mb-4">The more incidents you resolve, the smarter Pulse becomes.</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="memoryGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ee8ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#4ee8ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="range" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: '#151920',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              formatter={(value: number) => [`${value}%`, 'Match confidence']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4ee8ff"
              strokeWidth={2}
              fill="url(#memoryGrowthGradient)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
