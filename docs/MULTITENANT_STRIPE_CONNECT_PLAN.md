# PROB Multi-Tenant Platform Plan

## Goal

Convert PROB from a single-install application into a platform that can create,
administer, replicate, and monetize multiple tenant projects from one
superadmin console.

The target model follows the working PROL pattern, with one important fix:
custom domains must be resolved at request time, not only stored in the admin
panel.

## Deployment Modes

One codebase, two run modes selected by the `PLATFORM_MODE` env var (default
`standalone`):

- **`managed`** — our SaaS (`prob.prosuite.pro`). Multi-tenant on a shared
  Postgres, `/super-admin` console, Stripe Connect destination charges with an
  `application_fee` and per-tenant revenue share. Tenants are created from
  `/super-admin`; the self-install wizard is disabled (`/install` redirects to
  `/super-admin`).
- **`standalone`** — an independent artist self-hosts their own copy. A single
  tenant is bootstrapped by `/install`, with their own Postgres, domain, and
  Stripe account. Charges are **direct** (no Connect, no `application_fee`, no
  revenue share); `/super-admin` returns 404.

Auth applies to both modes (DB-backed sessions). In `managed` the first
`SUPER_ADMIN` is created once via `/super-admin/setup` (self-locks afterwards);
in `standalone` the `TENANT_ADMIN` created by `/install` logs in at `/login`.

## Reference From PROL

PROL already validates the core approach:

- `Tenant` is the root entity for each client/project.
- `User.role = SUPER_ADMIN` can exist without `tenantId`.
- Tenant admins, staff, students/customers, content, payments, and feature flags
are scoped by `tenantId`.
- Subdomain routing is handled in middleware by extracting the tenant slug from
the request host.
- Stripe Connect accounts belong to tenants, not individual users.
- Each payment stores a revenue-share snapshot so historical financial reports
do not change when a tenant's commission changes later.

Gap detected in PROL:

- `customDomain` exists in the Prisma model and can be edited, but the active
tenant resolver only uses `x-tenant-slug`. Hostname/custom-domain lookup is not
completed there. PROB should resolve both `slug.platform-domain.com` and exact
custom domains from day one.

## Required Capabilities

### 1. Independent Domains And Subdomains

Each tenant needs at least one routable host:

- Platform subdomain: `tenant-slug.prob-domain.com`
- Optional custom domain: `cliente.com`, `www.cliente.com`, or a client-owned
  subdomain.

Recommended data model:

- `Tenant`
  - `id`
  - `name`
  - `slug`
  - `status`
  - `primaryDomain`
  - `brand settings`
  - `feature flags`
  - `stripeAccountId`
  - `stripeChargesEnabled`
  - `stripeDetailsSubmitted`
  - `revenueShareRate`
- `TenantDomain`
  - `tenantId`
  - `hostname`
  - `type`: `PLATFORM_SUBDOMAIN` or `CUSTOM_DOMAIN`
  - `status`: `PENDING`, `VERIFIED`, `ACTIVE`, `FAILED`
  - `verificationToken`
  - `verifiedAt`

Request resolution:

1. Normalize the `Host` header.
2. If host ends in the platform base domain, extract slug and resolve tenant.
3. Otherwise, perform exact lookup in `TenantDomain.hostname`.
4. Set request headers such as `x-tenant-id`, `x-tenant-slug`, and
   `x-tenant-host` for server components/actions.
5. Deny inactive, unverified, paused, or deleted tenants before loading
   tenant-owned pages.

For production, use a cached domain map via Redis/KV if the middleware runtime
cannot safely call the database.

### 2. One Superadmin Platform

Add a platform-level console, separate from tenant admin:

- `/super-admin` or `/platform`
  - Create tenant
  - Clone tenant from preset/template
  - Manage domains and DNS verification
  - Manage tenant status and feature flags
  - Set revenue-share percentage
  - View global revenue, platform fees, tenant payouts
  - View Stripe Connect status per tenant
  - Impersonation/audit tools only after audit logging is implemented

Tenant admins continue to use:

- `https://tenant-domain/admin`
  - Branding
  - Packages/services
  - WhatsApp/Evolution settings
  - Stripe Connect onboarding
  - Team/users for that tenant only

Authorization rules:

- `SUPER_ADMIN`: no required `tenantId`, can administer all tenants.
- `TENANT_ADMIN`: must have `tenantId`, can only modify that tenant.
- `STAFF`/`MEMBER`: tenant-scoped operational roles.
- All tenant-owned queries must filter by `tenantId`.

### 3. Replicable Tenants

The current `/install` wizard should become a tenant creation wizard controlled
by the platform.

Recommended models:

- `TenantTemplate`
  - name, description, default project type, default colors, default features
- `TenantTemplatePackage`
  - reusable service/package definitions
- `TenantTemplateMessage`
  - default WhatsApp/email message templates
- `TenantProvisioningJob`
  - tracks provisioning status, errors, and created resources

Recommended flow:

1. Superadmin selects a template.
2. Wizard collects client/project data.
3. Platform creates tenant, default admin, domains, packages, message
   templates, integrations, and feature flags inside one transaction where
   possible.
4. External resources are provisioned after the database transaction:
   Stripe Connect account link, optional Evolution instance, DNS instructions.
5. Provisioning status is visible in superadmin.

## Stripe Connect Revenue Share

Use platform-owned Stripe keys. Each tenant connects its own Stripe account.

Checkout should use destination charges:

- `payment_intent_data.application_fee_amount`
- `payment_intent_data.transfer_data.destination = tenant.stripeAccountId`

Store every payment with immutable revenue fields:

- `tenantId`
- `grossAmount`
- `currency`
- `platformFee`
- `tenantReceives`
- `stripeFee`
- `revenueShareRate`
- `stripeAccountId`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId`
- `status`

Webhook requirements:

- Verify Stripe webhook signature.
- Process `checkout.session.completed`, async payment events, refunds, disputes,
  and Connect account updates.
- Use idempotency keys or unique Stripe IDs to prevent duplicate payment rows.
- Update tenant Connect status from Stripe account events.

## Implementation Phases

### Phase 1: Multi-Tenant Foundation

- Replace singleton `Organization`, `BankSettings`, and `IntegrationSettings`
  with tenant-scoped records.
- Add `Tenant`, `TenantDomain`, and role enums.
- Add `tenantId` to packages, message templates, users, and future booking/order
  records.
- Add tenant resolver middleware/proxy.
- Add `getCurrentTenant()` and `requireTenantAdmin()` helpers.

### Phase 2: Superadmin

- Add `/super-admin` shell.
- Add tenant list/detail/create flows.
- Add tenant domain management and DNS instructions.
- Add feature flags and status controls.

### Phase 3: Replication Wizard

- Convert `/install` into `/super-admin/tenants/new`.
- Add template/preset tables.
- Seed default templates from current installer presets.
- Add clone-from-template provisioning logic.

### Phase 4: Stripe Connect

- Add tenant Connect onboarding.
- Add payment checkout with application fees.
- Add Stripe webhook handling and revenue reporting.
- Add tenant payout/readiness status to superadmin.

### Phase 5: Evolution Per Tenant

- Store Evolution config per tenant.
- Support one instance per tenant or shared gateway with tenant routing.
- Add webhook tenant resolution by instance name and configured secret.

## Recommendation

Proceed with the PROL architecture as the baseline, but implement PROB as a
cleaner generic platform:

- Keep one deployable app.
- Use tenants for each client/project.
- Route tenants by subdomain and custom domain.
- Administer all tenants from one superadmin console.
- Use templates/jobs to replicate tenant installs.
- Use Stripe Connect per tenant with platform application fees.
