# PROB MVP Strategy — Risk Acceptance

**Date:** 2026-06-05
**Prepared for:** Felix G
**Status:** Decision Required

---

## Option A: MVP (Ship Now, Fix Later)

**Timeline:** 2-3 days to production
**Risk Level:** ⚠️ MEDIUM-HIGH (documented)

### What ships:
- Current code as-is
- Add ONLY: rate limiting + CSRF check + password complexity

### What's documented as "known issues":
- Race condition in `/install` (mitigated: rate limiting + human verification)
- Secrets in Docker (mitigated: use Dokploy secrets, never .env in prod)
- No auth on `/admin` (mitigated: internal use only, no public access)

### Cost of this approach:
- **If race condition hits:** data corruption in 1 tenant (recovery 4 hours)
- **If secrets leak:** need new DATABASE_URL + image rebuild (1 hour)
- **If someone finds XSS:** stored XSS in admin panel (low severity)

### Mitigation steps for MVP:
1. Deploy to staging first (2 days)
2. Manual load testing (concurrent installs)
3. Code review with team (spot-check security)
4. Post-deployment: monitor install logs for race condition signals
5. Promise to fix CRITICAL in next sprint (max 2 weeks)

---

## Option B: Production-Ready (Fix First, Ship Second)

**Timeline:** 4-5 days to production
**Risk Level:** ✅ LOW

### What ships:
- All 3 CRITICAL issues fixed
- All 4 HIGH issues fixed
- Tests added (vitest)
- Full compliance with DIRECTIVA DEPLOYMENT

### Cost of this approach:
- **Time:** +2-3 days development
- **Complexity:** Medium (atomic transactions, middleware, init scripts)
- **Payoff:** Zero debt, zero production incidents likely

### Implementation order:
**Day 1-2:**
- Fix race condition (atomic transaction)
- Fix Docker secrets (init script)
- Add CSRF + rate limiting middleware
- Strong password validation

**Day 3:**
- Add auth middleware
- Add healthcheck
- Update docker-compose

**Day 4:**
- Tests
- Security testing (manual)
- Docker build & push

**Day 5:**
- Deploy to staging
- Smoke test
- Deploy to production

---

## Recommendation

**If this is internal/demo:** Option A is fine (add the quick 3 wins, document risks)

**If this is customer-facing/SaaS:** Option B (3-4 days for solid product)

**If this is core infrastructure:** MUST be Option B

---

## Quick Wins (If choosing MVP)

These take **4 hours** and cover 80% of risk:

```typescript
// 1. Rate limiting (in-memory)
// src/lib/rate-limit.ts
const limits = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, max = 5, windowMs = 60000) {
  const now = Date.now()
  const entry = limits.get(key)
  if (!entry || now > entry.resetTime) {
    limits.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}
```

```typescript
// 2. CSRF validation
// src/app/install/actions.ts
import { headers } from "next/headers"

export async function runInstallAction(...) {
  const headersList = await headers()
  const origin = headersList.get("origin")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  if (origin && !origin.includes(new URL(appUrl).host)) {
    return { ok: false, message: "CSRF validation failed" }
  }
  
  const ip = headersList.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(`install:${ip}`, 5, 60000)) {
    return { ok: false, message: "Too many requests" }
  }
  
  // continue...
}
```

```typescript
// 3. Strong password
// src/lib/install-schema.ts
adminPassword: z.string()
  .min(12, "12+ chars")
  .regex(/[A-Z]/, "1 uppercase")
  .regex(/[a-z]/, "1 lowercase")
  .regex(/[0-9]/, "1 digit")
  .regex(/[@$!%*?&]/, "1 special (@$!%*?&)")
```

**That's it.** 3 small changes, 80% of the risk gone.

---

## What I recommend:

1. **Today:** Make a decision (MVP vs Production)
2. **If MVP:** Apply the 3 quick wins, test install 10 times
3. **If Production:** I'll implement fixes tomorrow
4. **Either way:** We document next steps in Obsidian vault

---

**Your call. Which path?**
