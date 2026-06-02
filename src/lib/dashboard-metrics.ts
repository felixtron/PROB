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
  pipelineValue: number // sum of baseAmount of pending bookings, in cents
  pipelineCount: number // # of pending bookings
  conversionPct: number | null // confirmed / total bookings (null if total=0)
  confirmedCount: number
  totalBookingsCount: number
}

export type UpcomingEvent = {
  id: string
  date: Date
  clientName: string
  packageName: string | null
  status: string
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

  const [pendingPaymentsCount, pipelineAgg, bookingCounts] = await Promise.all([
    db.payment.count({
      where: { tenantId, status: { in: ["processing", "failed"] } },
    }),
    db.bookingRequest.aggregate({
      where: { tenantId, status: "pending" },
      _sum: { baseAmount: true },
      _count: { _all: true },
    }),
    db.bookingRequest.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { _all: true },
    }),
  ])

  const countByStatus = Object.fromEntries(bookingCounts.map((c) => [c.status, c._count._all]))
  const confirmedCount = countByStatus["confirmed"] ?? 0
  const totalBookingsCount = Object.values(countByStatus).reduce((acc, n) => acc + n, 0)
  const conversionPct =
    totalBookingsCount > 0 ? Math.round((confirmedCount / totalBookingsCount) * 100) : null

  return {
    thisMonthTotal,
    prevMonthTotal,
    deltaPct,
    pendingPaymentsCount,
    succeededThisMonthCount: thisMonthBucket?.count ?? 0,
    buckets,
    pipelineValue: pipelineAgg._sum.baseAmount ?? 0,
    pipelineCount: pipelineAgg._count._all,
    conversionPct,
    confirmedCount,
    totalBookingsCount,
  }
}

export async function getUpcomingEvents(tenantId: string, now: Date, limit = 5): Promise<UpcomingEvent[]> {
  // Use BookingRequest with confirmed status as the source of upcoming work
  // until /admin/eventos lands and we use Event directly.
  const bookings = await db.bookingRequest.findMany({
    where: {
      tenantId,
      status: "confirmed",
      requestedDate: { gte: now },
    },
    orderBy: { requestedDate: "asc" },
    take: limit,
    select: {
      id: true,
      requestedDate: true,
      clientName: true,
      packageName: true,
      status: true,
    },
  })

  return bookings
    .filter((b) => b.requestedDate !== null)
    .map((b) => ({
      id: b.id,
      date: b.requestedDate as Date,
      clientName: b.clientName,
      packageName: b.packageName,
      status: b.status,
    }))
}
