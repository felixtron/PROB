-- CreateTable
CREATE TABLE "Musician" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "instruments" TEXT NOT NULL DEFAULT '[]',
    "bio" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Musician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Musician_tenantId_idx" ON "Musician"("tenantId");

-- AddForeignKey
ALTER TABLE "Musician" ADD CONSTRAINT "Musician_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
