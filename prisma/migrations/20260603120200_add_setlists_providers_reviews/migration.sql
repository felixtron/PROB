-- Setlist: ordered playlists composed of Songs from the tenant catalog.
CREATE TABLE "Setlist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setlist_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Setlist_tenantId_idx" ON "Setlist"("tenantId");
CREATE INDEX "Setlist_tenantId_active_idx" ON "Setlist"("tenantId", "active");

ALTER TABLE "Setlist" ADD CONSTRAINT "Setlist_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- SetlistSong: junction table with position for stable ordering.
CREATE TABLE "SetlistSong" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetlistSong_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SetlistSong_setlistId_songId_key" ON "SetlistSong"("setlistId", "songId");
CREATE INDEX "SetlistSong_tenantId_idx" ON "SetlistSong"("tenantId");
CREATE INDEX "SetlistSong_setlistId_position_idx" ON "SetlistSong"("setlistId", "position");

ALTER TABLE "SetlistSong" ADD CONSTRAINT "SetlistSong_setlistId_fkey"
    FOREIGN KEY ("setlistId") REFERENCES "Setlist"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SetlistSong" ADD CONSTRAINT "SetlistSong_songId_fkey"
    FOREIGN KEY ("songId") REFERENCES "Song"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Provider: external suppliers (sonido, iluminación, foto, video, transporte, etc.).
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "city" TEXT,
    "baseRate" INTEGER,
    "currency" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Provider_tenantId_idx" ON "Provider"("tenantId");
CREATE INDEX "Provider_tenantId_active_idx" ON "Provider"("tenantId", "active");
CREATE INDEX "Provider_tenantId_category_idx" ON "Provider"("tenantId", "category");

ALTER TABLE "Provider" ADD CONSTRAINT "Provider_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Review: client testimonials. `published=false` keeps drafts out of the landing.
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "eventTitle" TEXT,
    "eventDate" TIMESTAMP(3),
    "rating" INTEGER NOT NULL DEFAULT 5,
    "quote" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_tenantId_idx" ON "Review"("tenantId");
CREATE INDEX "Review_tenantId_published_idx" ON "Review"("tenantId", "published");

ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
