-- Rehearsal: internal band rehearsals (no client involvement).
CREATE TABLE "Rehearsal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "locationName" TEXT,
    "address" TEXT,
    "mapsLink" TEXT,
    "goal" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rehearsal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Rehearsal_tenantId_idx" ON "Rehearsal"("tenantId");
CREATE INDEX "Rehearsal_tenantId_date_idx" ON "Rehearsal"("tenantId", "date");
CREATE INDEX "Rehearsal_tenantId_status_idx" ON "Rehearsal"("tenantId", "status");

ALTER TABLE "Rehearsal" ADD CONSTRAINT "Rehearsal_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- RehearsalAttendance: which musicians are invited / confirmed / declined per rehearsal.
CREATE TABLE "RehearsalAttendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rehearsalId" TEXT NOT NULL,
    "musicianId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehearsalAttendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RehearsalAttendance_rehearsalId_musicianId_key" ON "RehearsalAttendance"("rehearsalId", "musicianId");
CREATE INDEX "RehearsalAttendance_tenantId_idx" ON "RehearsalAttendance"("tenantId");
CREATE INDEX "RehearsalAttendance_musicianId_idx" ON "RehearsalAttendance"("musicianId");

ALTER TABLE "RehearsalAttendance" ADD CONSTRAINT "RehearsalAttendance_rehearsalId_fkey"
    FOREIGN KEY ("rehearsalId") REFERENCES "Rehearsal"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RehearsalAttendance" ADD CONSTRAINT "RehearsalAttendance_musicianId_fkey"
    FOREIGN KEY ("musicianId") REFERENCES "Musician"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- BandEvent: the band's own gigs (residencies, festivals, shows) distinct from client bookings.
-- `published` exposes the event on the public landing's upcoming list.
CREATE TABLE "BandEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'show',
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "venueName" TEXT,
    "city" TEXT,
    "country" TEXT,
    "ticketUrl" TEXT,
    "publicNotes" TEXT,
    "internalNotes" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BandEvent_tenantId_idx" ON "BandEvent"("tenantId");
CREATE INDEX "BandEvent_tenantId_date_idx" ON "BandEvent"("tenantId", "date");
CREATE INDEX "BandEvent_tenantId_published_idx" ON "BandEvent"("tenantId", "published");
CREATE INDEX "BandEvent_tenantId_status_idx" ON "BandEvent"("tenantId", "status");

ALTER TABLE "BandEvent" ADD CONSTRAINT "BandEvent_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
