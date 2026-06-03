"use client"

import { useMemo } from "react"

interface MonthData {
  month: string
  total: number
  count: number
}

const PADDING_LEFT = 72
const PADDING_RIGHT = 16
const PADDING_TOP = 28
const PADDING_BOT = 44
const CHART_H = 160

export function IncomeChart({
  data,
  currency = "MXN",
}: {
  data: MonthData[]
  currency?: string
}) {
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
      }),
    [currency],
  )

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin datos de ingresos aún.
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)
  const n = data.length
  const BAR_GROUP = 60
  const BAR_W = 38
  const totalW = PADDING_LEFT + n * BAR_GROUP + PADDING_RIGHT
  const totalH = PADDING_TOP + CHART_H + PADDING_BOT

  const yPcts = [0, 0.33, 0.66]

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ minWidth: `${Math.max(totalW, 280)}px` }}
      >
        <defs>
          <linearGradient id="barMagenta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(233,30,99)" stopOpacity={0.95} />
            <stop offset="100%" stopColor="rgb(136,14,79)" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="barMagentaHi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(244,143,177)" stopOpacity={1} />
            <stop offset="100%" stopColor="rgb(233,30,99)" stopOpacity={0.9} />
          </linearGradient>
        </defs>

        {yPcts.map((pct) => {
          const y = PADDING_TOP + CHART_H - pct * CHART_H
          return (
            <g key={pct}>
              <line
                x1={PADDING_LEFT}
                y1={y}
                x2={totalW - PADDING_RIGHT}
                y2={y}
                stroke="rgba(0,0,0,0.08)"
                strokeWidth={1}
              />
              <text
                x={PADDING_LEFT - 6}
                y={y + 3.5}
                textAnchor="end"
                fontSize={9}
                fill="rgba(0,0,0,0.4)"
                fontFamily="sans-serif"
              >
                {fmt.format(pct * maxTotal)}
              </text>
            </g>
          )
        })}

        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP + CHART_H}
          x2={totalW - PADDING_RIGHT}
          y2={PADDING_TOP + CHART_H}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barH = Math.max((d.total / maxTotal) * CHART_H, 4)
          const barX = PADDING_LEFT + i * BAR_GROUP + (BAR_GROUP - BAR_W) / 2
          const barY = PADDING_TOP + CHART_H - barH
          const isMax = d.total === maxTotal
          const valY = Math.max(barY - 8, PADDING_TOP + 9)

          return (
            <g key={`${d.month}-${i}`}>
              <rect x={barX + 2} y={barY + 3} width={BAR_W} height={barH} rx={5} fill="rgba(233,30,99,0.15)" />
              <rect x={barX} y={barY} width={BAR_W} height={barH} rx={5} fill={isMax ? "url(#barMagentaHi)" : "url(#barMagenta)"} />

              <rect
                x={barX + BAR_W / 2 - 24}
                y={valY - 10}
                width={48}
                height={13}
                rx={3}
                fill="rgba(0,0,0,0.04)"
              />
              <text
                x={barX + BAR_W / 2}
                y={valY}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight="bold"
                fill={isMax ? "rgb(233,30,99)" : "rgba(0,0,0,0.7)"}
              >
                {fmt.format(d.total)}
              </text>

              <text
                x={barX + BAR_W / 2}
                y={PADDING_TOP + CHART_H + 18}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fill="rgba(0,0,0,0.85)"
              >
                {d.month.slice(0, 3)}
              </text>

              <text
                x={barX + BAR_W / 2}
                y={PADDING_TOP + CHART_H + 32}
                textAnchor="middle"
                fontSize={8}
                fill="rgba(0,0,0,0.4)"
              >
                {d.count} show{d.count !== 1 ? "s" : ""}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
