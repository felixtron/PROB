-- AlterTable
ALTER TABLE "Tenant"
    ADD COLUMN "legalName" TEXT,
    ADD COLUMN "legalRfc" TEXT,
    ADD COLUMN "contractLegalText" TEXT;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookingRequestId" TEXT NOT NULL,
    "shortToken" TEXT NOT NULL,
    "legalSnapshot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "adminSignerName" TEXT,
    "adminSignedAt" TIMESTAMP(3),
    "clientSignerName" TEXT,
    "clientSignatureDataUrl" TEXT,
    "clientSignedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_bookingRequestId_key" ON "Contract"("bookingRequestId");
CREATE UNIQUE INDEX "Contract_shortToken_key" ON "Contract"("shortToken");
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");
CREATE INDEX "Contract_tenantId_status_idx" ON "Contract"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
