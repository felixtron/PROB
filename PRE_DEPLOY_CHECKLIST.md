# Pre-Deploy Checklist — PROB (priscastromusic)

**Fecha:** 2026-06-05
**Revisor:** Probot
**Status:** 🔴 NOT READY FOR PRODUCTION

---

## Security Checklist

- [ ] **CRITICAL: Race condition fixed** 
  - [ ] `/install` action is atomic (transaction validates + creates + marks completed)
  - [ ] Tested: concurrent POST requests don't create duplicate tenants
  - [ ] Tested: second install attempt after completion returns error

- [ ] **CRITICAL: Dockerfile secrets leak fixed**
  - [ ] `prisma db push` removed from builder stage
  - [ ] `prisma generate` only in build
  - [ ] `init-db.sh` script created and runs at startup
  - [ ] `DATABASE_URL` NOT in `FROM base` ENV
  - [ ] Tested: build succeeds without DATABASE_URL

- [ ] **CRITICAL: CSRF protection added**
  - [ ] Middleware validates Origin header OR CSRF token exists
  - [ ] `POST /install` from cross-origin request returns 403
  - [ ] POST from legitimate origin succeeds

- [ ] **HIGH: Rate limiting on /install**
  - [ ] Middleware limits to 5 requests/min per IP
  - [ ] 6th request within 1 min returns 429
  - [ ] Tested with curl/ab tool

- [ ] **HIGH: Strong password validation**
  - [ ] adminPassword requires: 12+ chars, uppercase, lowercase, number, special
  - [ ] Validation errors shown in UI
  - [ ] Tested: weak password rejected
  - [ ] Tested: strong password accepted

- [ ] **MEDIUM: Input sanitization**
  - [ ] organizationName, adminName validated with regex: `^[a-zA-Z0-9\s\-.,´'()&]+$`
  - [ ] HTML entities escaped in rendering
  - [ ] Tested: `<script>alert('xss')</script>` as adminName doesn't execute

- [ ] **MEDIUM: Auth middleware on /admin**
  - [ ] `src/middleware.ts` protects `/admin/*`
  - [ ] Unauthenticated user redirected to `/install`
  - [ ] Tenant isolation: user can only see their own tenant's admin
  - [ ] Tested: user from tenant A cannot see tenant B admin panel

---

## Docker & Deployment Checklist

- [ ] **Healthcheck configured**
  - [ ] `docker-compose.yml` has healthcheck block
  - [ ] `/api/health` endpoint returns 200 when healthy
  - [ ] Tested: `curl http://localhost:3010/api/health` returns `{"status":"ok"}`

- [ ] **Dockerfile production-ready**
  - [ ] Node version pinned: `node:20.14.0-alpine` (not `node:20-alpine`)
  - [ ] Non-root user: runs as `nextjs:nodejs` (uid 1001)
  - [ ] Multi-stage: deps, builder, runner
  - [ ] `init-db.sh` copied and executable
  - [ ] Build tested: `docker build -t prob:test .`

- [ ] **docker-compose.yml updated (per DIRECTIVA)**
  - [ ] `restart: unless-stopped` set
  - [ ] Resource limits: `cpus: 1`, `memory: 512M` (adjust for your infra)
  - [ ] Logging configured: `json-file` driver with rotation
  - [ ] NO exposed ports to host (if using Traefik, verify labels)
  - [ ] Volume paths correct

- [ ] **Environment variables**
  - [ ] `.env.example` committed (no secrets)
  - [ ] `.env` is in `.gitignore`
  - [ ] `.gitignore` includes: `.env`, `.db`, `node_modules`
  - [ ] `AUTH_SECRET` generated: `openssl rand -base64 32`

---

## Database Checklist

- [ ] **Prisma migrations**
  - [ ] `npx prisma migrate dev` creates migration for indexes
  - [ ] Schema updated with `@@index([tenantId])` on User, TenantProvisioningJob
  - [ ] `prisma generate` runs successfully
  - [ ] Tested: database schema matches expectations

- [ ] **Database file location**
  - [ ] SQLite db file: `/app/prisma/dev.db` in container (or libSQL URL in .env)
  - [ ] `prisma` volume mounted: `./prisma:/app/prisma`
  - [ ] Backup strategy in place (if important data)

---

## Testing Checklist

- [ ] **Manual testing**
  - [ ] Fresh install: visit `http://localhost:3010/install`, complete wizard
  - [ ] Subsequent access redirects to `/admin` (install locked)
  - [ ] Admin panel loads without errors
  - [ ] Packages display correctly
  - [ ] Test with concurrent installs (curl loop): verify no duplicates
  - [ ] Rate limiter: POST `/install` 6+ times in 1 min, verify 429 on 6th

- [ ] **Security testing**
  - [ ] Try CSRF: POST `/install` from `curl` with `Origin: http://attacker.com` → should fail
  - [ ] Weak password: submit `adminPassword: "weak"` → rejected
  - [ ] XSS: `organizationName: "<img src=x onerror='alert(1)'>"` → stored safely, doesn't execute
  - [ ] SQL injection: `slug: "test'; DROP TABLE tenants;--"` → no SQL error, not found

- [ ] **Automated tests**
  - [ ] Vitest setup: `npm test` passes
  - [ ] At minimum: `install-schema.test.ts` validates all fields
  - [ ] Provisioning logic tested (atomic transaction behavior)

---

## Production Readiness Checklist (per DIRECTIVA)

- [ ] **Container image**
  - [ ] Dockerfile: multi-stage, USER non-root, healthcheck ENV
  - [ ] Image pushed to `ghcr.io/felixtron/<client>-<role>:<sha>`
  - [ ] Image scanned for vulnerabilities (Trivy or similar)

- [ ] **Networking**
  - [ ] ZERO ports exposed to host (all via Traefik)
  - [ ] Container on `dokploy-network` overlay
  - [ ] One network per client (if multi-tenant)

- [ ] **Logging**
  - [ ] Docker logging: `json-file` driver with rotation
  - [ ] App logs: structured (pino/winston) with requestId
  - [ ] Logs sent to centralized system (Loki, CloudWatch, etc.)

- [ ] **Secrets management**
  - [ ] DATABASE_URL stored in Docker Swarm secrets OR Dokploy env (encrypted)
  - [ ] AUTH_SECRET in secrets (never in .env file)
  - [ ] Third-party keys (Stripe, Evolution, etc.) in secrets

- [ ] **Labels & metadata**
  - [ ] Docker labels set: `com.prosuite.client`, `com.prosuite.role`, `com.prosuite.git-sha`
  - [ ] Labels include: owner, timestamp, version

- [ ] **Directory structure**
  - [ ] App deployed in `/opt/stacks/<client>/`
  - [ ] Owned by `root:docker` with mode `750`
  - [ ] `docker-compose.yml` in repo root

---

## Monitoring & Observability

- [ ] **Health checks**
  - [ ] Healthcheck endpoint responds < 200ms
  - [ ] Container auto-restarts on health failure

- [ ] **Error tracking**
  - [ ] Sentry or similar integrated (optional but recommended)
  - [ ] Critical errors alerted to team

- [ ] **Metrics (optional)**
  - [ ] Request count, latency tracked
  - [ ] Database pool connections monitored
  - [ ] Tenant creation metrics logged

---

## Sign-Off

**Ready for staging?**
- [ ] All CRITICAL + HIGH issues resolved
- [ ] Security tests pass
- [ ] Docker builds without warnings

**Ready for production?**
- [ ] All MEDIUM issues resolved
- [ ] Observability configured
- [ ] Backup strategy in place
- [ ] Runbooks written (how to troubleshoot, recover, scale)
- [ ] Team trained on deployment

---

## Notes

- **MVP approach:** Ship CRITICAL only, document known MEDIUM issues for next sprint
- **Production approach:** Fix CRITICAL + HIGH, add observability, then deploy
- **Post-deployment:** Monitor /admin auth logs, install rate limits, tenant creation metrics

---

**Questions?** See `REVIEW_FIXES.md` for code examples for each issue.
