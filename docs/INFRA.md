# PROB Infrastructure

This document covers the production deploy of PROB on a Docker Swarm VPS sitting behind
the Dokploy-managed Traefik. Source of truth for environment, networks, and the canonical
deployment procedure.

## Targets

| Concern             | Production                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| Base domain         | `prob.prosuite.pro` (+ wildcard `*.prob.prosuite.pro` for tenant subdomains) |
| Reverse proxy       | Traefik v3.3 (shared with Dokploy)                                         |
| TLS                 | Let's Encrypt via `letsencrypt-dns` cert resolver (Cloudflare dnsChallenge) |
| Database            | `prob_db` on the shared `dokploy-postgres` (postgres:16)                   |
| Container registry  | `ghcr.io/felixtron/prob`                                                   |
| Orchestrator        | Docker Swarm — service runs on the `dokploy-network` overlay               |
| Internal port       | 3010                                                                       |

## Secrets

All secrets live in `/etc/dokploy/prob.env` on the VPS (root-owned, `0600`). The file is
sourced by `stack.yml` via `env_file`. **Never commit this file.**

Required keys:

- `DATABASE_URL=postgresql://prob:<pass>@dokploy-postgres:5432/prob_db?schema=public`
- `AUTH_SECRET=<openssl rand -base64 32>`
- `CLOUDFLARE_DNS_API_TOKEN=<token>` (used by Traefik for dnsChallenge — read by Traefik
  from the same file mounted into the Traefik service, see `traefik.yml`)
- `CLOUDFLARE_ZONE=prosuite.pro`

Optional integration keys (`STRIPE_*`, `EVOLUTION_*`, etc.) are populated per-tenant via
the `/super-admin` flow and stored in the database — the env file holds only platform-wide
secrets.

## Deploy

The image is built and pushed by GitHub Actions (`.github/workflows/build.yml`) on every
push. Tags:

- `latest` — only on default branch
- `sha-<short>` — every commit
- `branch-<name>` — non-default branches
- `vX.Y.Z` — on tag pushes

To deploy a specific image on the VPS:

```bash
ssh panel-prosuite
docker login ghcr.io                     # one-time, PAT with read:packages
export PROB_TAG=sha-abcd123               # or `latest`
docker stack deploy -c /etc/dokploy/prob/stack.yml --with-registry-auth prob
```

The service runs `prisma migrate deploy` in its entrypoint, so schema changes are applied
automatically when the container boots.

## DNS

- `prob.prosuite.pro` → A `66.29.152.229` (DNS-only)
- `*.prob.prosuite.pro` → A `66.29.152.229` (DNS-only, used by Traefik dnsChallenge and to
  reach tenant subdomains).

A single wildcard certificate covers both the apex and all tenant subdomains, so adding a
new tenant requires no Traefik or DNS changes.

## Provision a new tenant

1. Go to `https://prob.prosuite.pro/super-admin`.
2. Run the create-tenant wizard. A `Tenant` row, `TenantDomain` of type
   `PLATFORM_SUBDOMAIN` (`<slug>.prob.prosuite.pro`), admin user, default packages and
   message templates are created in one transaction.
3. The new subdomain is immediately reachable thanks to the wildcard DNS + wildcard TLS
   cert.

For custom domains, add a `TenantDomain` of type `CUSTOM_DOMAIN`, point the customer's DNS
to `66.29.152.229`, and once the host appears in the resolver's HTTP-01 challenge a cert
will be issued by the `letsencrypt` resolver (httpChallenge, the original one).

## Roll back

`docker service rollback prob_prob` reverts to the previous task. For image-level rollback,
pin `PROB_TAG=sha-<previous>` and re-deploy.

## Local dev

```bash
cp .env.example .env
docker compose up -d            # spins up postgres + builds the app
docker compose exec prob npx prisma migrate deploy
```

Visit http://localhost:3010 — the wizard at `/install` runs once for local seeding.
