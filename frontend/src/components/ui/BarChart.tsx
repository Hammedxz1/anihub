interface BarChartProps {
  data: Array<{ date: string; count: number }>
  height?: number
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const barWidth = 100 / Math.max(data.length, 1)

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.count / max) * (height - 8)
          return (
            <g key={d.date}>
              <rect
                x={i * barWidth + barWidth * 0.15}
                y={height - h}
                width={barWidth * 0.7}
                height={h}
                rx={1}
                fill="url(#bar-grad)"
              >
                <title>{`${d.date}: ${d.count} chapters`}</title>
              </rect>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-surface-muted">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}
