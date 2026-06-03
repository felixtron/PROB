-- SiteMedia: curated landing assets — gallery photos, press logos, hero/promo banners.
-- `kind` discriminates render destination on the public landing.
-- `sortOrder` allows manual reordering; published toggles visibility on the landing.
CREATE TABLE "SiteMedia" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'gallery',
    "title" TEXT,
    "alt" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "caption" TEXT,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteMedia_tenantId_idx" ON "SiteMedia"("tenantId");
CREATE INDEX "SiteMedia_tenantId_kind_published_sortOrder_idx"
    ON "SiteMedia"("tenantId", "kind", "published", "sortOrder");

ALTER TABLE "SiteMedia" ADD CONSTRAINT "SiteMedia_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
