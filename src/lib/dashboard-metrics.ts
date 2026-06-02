import { db } from "@/lib/db"

export type MonthBucket = {
  monthKey: string // "YYYY-MM"
  monthLabel: string // "Jun '26"
  total: number // in smallest currency unit (centavos)
  count: number
}

const MONTH_LABELS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

function monthKeyOf(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabelOf(d: Date) {
  return `${MONTH_LABELS_ES[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(-2)}`
}

export async function getRevenueByMonth(
  tenantId: string,
  monthsBack: number,
  now: Date,
): Promise<MonthBucket[]> {
  // Build the contiguous month buckets first (so months with zero revenue still appear).
  const buckets: MonthBucket[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    buckets.push({
      monthKey: monthKeyOf(d),
      monthLabel: monthLabelOf(d),
      total: 0,
      count: 0,
    })
  }

  // Single query for all payments in window, aggregate in JS.
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1))
  const payments = await db.payment.findMany({
    where: {
      tenantId,
      status: "succeeded",
      paidAt: { gte: windowStart },
    },
    select: { amount: true, paidAt: true },
  })

  for (const p of payments) {
    if (!p.paidAt) continue
    const key = monthKeyOf(p.paidAt)
    const bucket = buckets.find((b) => b.monthKey === key)
    if (bucket) {
      bucket.total += p.amount
      bucket.count += 1
    }
  }

  return buckets
}

export type DashboardMetrics = {
  thisMonthTotal: number
  prevMonthTotal: number
  deltaPct: number | null // null = no previous month data to compare
  pendingPaymentsCount: number
  succeededThisMonthCount: number
  buckets: MonthBucket[]
}

export async function getDashboardMetrics(
  tenantId: string,
  now: Date,
): Promise<DashboardMetrics> {
  const buckets = await getRevenueByMonth(tenantId, 6, now)
  const thisMonthBucket = buckets[buckets.length - 1]
  const prevMonthBucket = buckets[buckets.length - 2]
  const thisMonthTotal = thisMonthBucket?.total ?? 0
  const prevMonthTotal = prevMonthBucket?.total ?? 0

  let deltaPct: number | null = null
  if (prevMonthTotal > 0) {
    deltaPct = Math.round(((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100)
  } else if (thisMonthTotal > 0) {
    deltaPct = 100
  }

  const pendingPaymentsCount = await db.payment.count({
    where: { tenantId, status: { in: ["processing", "failed"] } },
  })

  return {
    thisMonthTotal,
    prevMonthTotal,
    deltaPct,
    pendingPaymentsCount,
    succeededThisMonthCount: thisMonthBucket?.count ?? 0,
    buckets,
  }
}
