# Code Review Fixes — priscastromusic (PROB)

## CRITICAL Issues

### 1. Race Condition in `/install` — FIX

**Current (racy):**
```typescript
// src/app/install/actions.ts
if (await isInstalled()) {
  redirect("/admin")
}
// ← RACE WINDOW: another POST can pass here
const tenant = await provisionTenant(parsed.data)
await db.$transaction(async (tx) => {
  await tx.installationState.upsert({...})
})
```

**Fixed (atomic):**
```typescript
export async function runInstallAction(_: InstallActionState, formData: FormData): Promise<InstallActionState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = installSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const tenant = await db.$transaction(async (tx) => {
      // ATOMIC: check + create + mark installed all in one transaction
      const state = await tx.installationState.findUnique({ 
        where: { id: "singleton" } 
      })
      
      if (state?.completed) {
        throw new Error("Installation already completed")
      }

      // Provision tenant
      const newTenant = await provisionTenant(parsed.data, tx)
      
      // Mark installed
      await tx.installationState.upsert({
        where: { id: "singleton" },
        update: { 
          tenantId: newTenant.id, 
          completed: true, 
          completedAt: new Date() 
        },
        create: { 
          id: "singleton", 
          tenantId: newTenant.id, 
          completed: true, 
          completedAt: new Date() 
        },
      })
      
      return newTenant
    })
    
    redirect("/admin")
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Installation failed",
    }
  }
}
```

**Note:** Modify `provisionTenant()` signature to accept optional `tx: Prisma.TransactionClient` parameter.

---

### 2. Secrets in Docker Build — FIX

**Current (leaks DATABASE_URL):**
```dockerfile
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/tmp/build.db
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss  # ← PROBLEM: db push with ENV vars
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build
```

**Fixed:**
```dockerfile
FROM node:20.14.0-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/tmp/schema-only.db
# Only generate Prisma client, NO db push
RUN npx prisma generate
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts (no prisma data)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy init script
COPY --chown=nextjs:nodejs ./scripts/init-db.sh /app/init-db.sh
RUN chmod +x /app/init-db.sh

USER nextjs
EXPOSE 3010
ENV PORT=3010

# Run init before start (handles prisma db push)
CMD ["/bin/sh", "-c", "/app/init-db.sh && node server.js"]
```

**Create `scripts/init-db.sh`:**
```bash
#!/bin/sh
set -e

# Only run migrations if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set, skipping db push"
else
  echo "Running prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss
fi

echo "Init complete"
```

---

### 3. CSRF Protection — FIX

**Add middleware for CSRF validation:**

Create `src/middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010",
]

export function middleware(request: NextRequest) {
  // Only validate POST to /install
  if (request.method === "POST" && request.nextUrl.pathname === "/install") {
    const origin = request.headers.get("origin")
    
    if (!origin || !ALLOWED_ORIGINS.some(allowed => origin.includes(new URL(allowed).host))) {
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/install", "/api/:path*"],
}
```

**Or: Use nonce-based CSRF tokens (better):**

In `src/app/install/page.tsx`:
```typescript
import { generateNonce } from "@/lib/csrf"

export default async function InstallPage() {
  const nonce = generateNonce()
  
  return (
    <form action={runInstallAction}>
      <input type="hidden" name="csrfToken" value={nonce} />
      {/* form fields */}
    </form>
  )
}
```

In `src/app/install/actions.ts`:
```typescript
import { verifyCsrfToken } from "@/lib/csrf"

export async function runInstallAction(_: InstallActionState, formData: FormData): Promise<InstallActionState> {
  const csrfToken = formData.get("csrfToken") as string
  
  if (!await verifyCsrfToken(csrfToken)) {
    return {
      ok: false,
      message: "CSRF token invalid",
    }
  }
  
  // Continue...
}
```

---

## HIGH Issues

### 4. Rate Limiting — FIX

**Option A: Using Vercel Edge Middleware (recommended if on Vercel)**

Create `src/middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1m"),
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/install" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const { success, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again in 1 minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/install"],
}
```

**Option B: In-memory rate limiter (for self-hosted)**

Create `src/lib/rate-limit.ts`:
```typescript
interface RateLimitEntry {
  count: number
  resetTime: number
}

const limitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const entry = limitStore.get(key)

  if (!entry || now > entry.resetTime) {
    limitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count += 1
  return true
}
```

In `src/app/install/actions.ts`:
```typescript
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

export async function runInstallAction(_: InstallActionState, formData: FormData): Promise<InstallActionState> {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

  if (!checkRateLimit(`install:${ip}`, 5, 60000)) {
    return {
      ok: false,
      message: "Too many requests. Try again in 1 minute.",
    }
  }

  // Continue...
}
```

**Install Upstash (if using Vercel option):**
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

### 5. Strong Password Validation — FIX

**Update `src/lib/install-schema.ts`:**

```typescript
import { z } from "zod"

const optionalUrl = z.string().trim().url("URL inválida").or(z.literal("")).optional()

const strongPassword = z.string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos una minúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(/[@$!%*?&]/, "Debe incluir al menos un carácter especial: @$!%*?&")

export const installSchema = z.object({
  organizationName: z.string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .regex(/^[a-zA-Z0-9\s\-.,´'()&]+$/, "Nombre contiene caracteres inválidos"),
  projectType: z.string().trim().min(2, "Selecciona el tipo de proyecto"),
  shortDescription: z.string().trim().max(180).optional().or(z.literal("")),
  longDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().default("México"),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido"),
  website: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  spotifyUrl: optionalUrl,
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  primaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color primario inválido"),
  secondaryColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color secundario inválido"),
  currency: z.string().trim().min(3).max(3).default("MXN"),
  timezone: z.string().trim().min(3).default("America/Mexico_City"),
  adminName: z.string()
    .trim()
    .min(2, "Nombre de admin requerido")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Nombre contiene caracteres inválidos"),
  adminEmail: z.string().trim().email("Email de admin inválido"),
  adminPassword: strongPassword,
  packagePreset: z.enum(["band", "dj", "artist", "agency", "blank"]).default("band"),
  bankName: z.string().trim().optional().or(z.literal("")),
  bankAccount: z.string().trim().optional().or(z.literal("")),
  bankClabe: z.string().trim().optional().or(z.literal("")),
  bankBeneficiary: z.string().trim().optional().or(z.literal("")),
  stripePublishableKeyHint: z.string().trim().optional().or(z.literal("")),
  evolutionBaseUrl: optionalUrl,
  evolutionInstance: z.string().trim().optional().or(z.literal("")),
  googleCalendarId: z.string().trim().optional().or(z.literal("")),
})

export type InstallInput = z.infer<typeof installSchema>
```

---

## MEDIUM Issues

### 8. Auth Middleware for /admin — FIX

**Create `src/middleware.ts`:**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getCurrentTenant } from "@/lib/tenant"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const tenant = await getCurrentTenant()
    
    if (!tenant) {
      return NextResponse.redirect(new URL("/install", request.url))
    }

    // Store tenant in headers for downstream access
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-tenant-id", tenant.id)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
```

---

### 10. Docker Compose Healthcheck — FIX

**Update `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  prob:
    build: .
    container_name: prob-app
    restart: unless-stopped
    ports:
      - "3010:3010"
    env_file:
      - .env
    volumes:
      - ./prisma:/app/prisma
      - ./public/uploads:/app/public/uploads
    
    # Add healthcheck
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Optional: resource limits (recommended for production)
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Ensure `/api/health` endpoint exists and returns 200:**

`src/app/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    await db.installationState.findUnique({ 
      where: { id: "singleton" } 
    })
    
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    )
  }
}
```

---

### 11. Add Database Indexes — FIX

**Update `prisma/schema.prisma`:**

```prisma
model User {
  id        String   @id @default(uuid())
  tenantId  String?
  name      String?
  email     String   @unique
  password  String
  role      UserRole @default(TENANT_ADMIN)
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@index([email])
  @@index([createdAt])
}

model TenantProvisioningJob {
  id          String                @id @default(uuid())
  tenantId    String?
  templateId  String?
  status      ProvisioningJobStatus @default(PENDING)
  summary     String?
  error       String?
  inputJson   String                @default("{}")
  startedAt   DateTime?
  completedAt DateTime?
  tenant      Tenant?               @relation(fields: [tenantId], references: [id], onDelete: SetNull)
  template    TenantTemplate?       @relation(fields: [templateId], references: [id], onDelete: SetNull)
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  @@index([tenantId])
  @@index([templateId])
  @@index([createdAt])
}
```

Then run:
```bash
npx prisma migrate dev --name add_indexes
```

---

## Testing

Add vitest:
```bash
npm install -D vitest @testing-library/react happy-dom
```

Create `src/lib/__tests__/install-schema.test.ts`:
```typescript
import { describe, it, expect } from "vitest"
import { installSchema } from "@/lib/install-schema"

describe("installSchema", () => {
  it("rejects weak passwords", () => {
    const weak = {
      organizationName: "Test Band",
      projectType: "band",
      email: "band@example.com",
      adminName: "Admin",
      adminEmail: "admin@example.com",
      adminPassword: "weakpass", // Only 8 chars, no complexity
      packagePreset: "band",
    }

    const result = installSchema.safeParse(weak)
    expect(result.success).toBe(false)
  })

  it("accepts strong passwords", () => {
    const strong = {
      organizationName: "Test Band",
      projectType: "band",
      email: "band@example.com",
      adminName: "Admin",
      adminEmail: "admin@example.com",
      adminPassword: "SecureP@ss123", // 12+ chars with complexity
      packagePreset: "band",
    }

    const result = installSchema.safeParse(strong)
    expect(result.success).toBe(true)
  })
})
```

---

## Summary

**Phase 1 (Security — 1-2 days):**
- [ ] Fix race condition (atomic transaction)
- [ ] Fix Docker secrets leak
- [ ] Add CSRF protection
- [ ] Add rate limiting
- [ ] Strong password validation

**Phase 2 (Quality — 1 day):**
- [ ] Add auth middleware
- [ ] Add healthcheck
- [ ] Add database indexes
- [ ] Add vitest

**Phase 3 (Production — 1 day):**
- [ ] Update docker-compose per DIRECTIVA (limits, labels, logging)
- [ ] Test with docker-compose up

---

**See also:**
- `code-reviewer` skill for detailed review methodology
- DIRECTIVA DEPLOYMENT PROSUITE in memory
- `/opt/data/obsidian-vault/ProBrain/` for project context
