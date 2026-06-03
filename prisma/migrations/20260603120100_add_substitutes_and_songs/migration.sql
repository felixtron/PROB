-- AlterTable: Musician gets isTitular + titularId for substitute relationships.
-- New rows default to isTitular=true so existing musicians stay titulares.
ALTER TABLE "Musician"
    ADD COLUMN "isTitular" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "titularId" TEXT;

-- CreateIndex: musicians belonging to a titular look up via this index.
CREATE INDEX "Musician_titularId_idx" ON "Musician"("titularId");

-- AddForeignKey: self-reference. If the titular is deleted, the substitute
-- becomes orphaned (titularId -> NULL) rather than cascading.
ALTER TABLE "Musician" ADD CONSTRAINT "Musician_titularId_fkey"
    FOREIGN KEY ("titularId") REFERENCES "Musician"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Song catalog (repertorio).
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "genre" TEXT,
    "language" TEXT,
    "era" TEXT,
    "durationMin" INTEGER,
    "songKey" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Song_tenantId_idx" ON "Song"("tenantId");
CREATE INDEX "Song_tenantId_active_idx" ON "Song"("tenantId", "active");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
