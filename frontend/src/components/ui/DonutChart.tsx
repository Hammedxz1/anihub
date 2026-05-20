interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSlice[]
  size?: number
  thickness?: number
  centerLabel?: string
}

export function DonutChart({ data, size = 160, thickness = 22, centerLabel }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const center = size / 2

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1a1a26"
          strokeWidth={thickness}
        />
        {data.map((d) => {
          const length = (d.value / total) * circumference
          const dasharray = `${length} ${circumference - length}`
          const dashoffset = circumference / 4 - offset
          offset += length
          return (
            <circle
              key={d.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          )
        })}
        {centerLabel && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white font-display"
            style={{ fontSize: size * 0.18 }}
          >
            {centerLabel}
          </text>
        )}
      </svg>

      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-white/90">{d.label}</span>
            <span className="text-surface-muted">· {Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
