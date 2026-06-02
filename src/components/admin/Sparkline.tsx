type SparklinePoint = { label: string; value: number }

export function Sparkline({
  points,
  width = 600,
  height = 120,
  strokeColor = "var(--primary)",
  fillColor = "var(--primary)",
  fillOpacity = 0.12,
}: {
  points: SparklinePoint[]
  width?: number
  height?: number
  strokeColor?: string
  fillColor?: string
  fillOpacity?: number
}) {
  if (points.length === 0) {
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border)" strokeWidth={1.5} />
      </svg>
    )
  }

  const padX = 16
  const padY = 18
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const max = Math.max(...points.map((p) => p.value), 1)
  const step = points.length > 1 ? innerW / (points.length - 1) : 0

  const coords = points.map((p, i) => {
    const x = padX + i * step
    // Normalize: max -> top (padY), 0 -> bottom (height - padY)
    const y = padY + innerH - (p.value / max) * innerH
    return { x, y, label: p.label, value: p.value }
  })

  const polyline = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")
  const areaPath =
    `M${coords[0].x.toFixed(1)},${(height - padY).toFixed(1)} ` +
    coords.map((c) => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") +
    ` L${coords[coords.length - 1].x.toFixed(1)},${(height - padY).toFixed(1)} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={areaPath} fill={fillColor} fillOpacity={fillOpacity} />
      <polyline points={polyline} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c) => (
        <circle key={c.label} cx={c.x} cy={c.y} r={3} fill={strokeColor} />
      ))}
      {coords.map((c, i) => (
        <text
          key={c.label + i}
          x={c.x}
          y={height - 4}
          fontSize={11}
          textAnchor="middle"
          fill="var(--muted-foreground)"
        >
          {c.label}
        </text>
      ))}
    </svg>
  )
}
