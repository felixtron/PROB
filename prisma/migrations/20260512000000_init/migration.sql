-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantDomainType" AS ENUM ('PLATFORM_SUBDOMAIN', 'CUSTOM_DOMAIN');

-- CreateEnum
CREATE TYPE "TenantDomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProvisioningJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryDomain" TEXT,
    "projectType" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#e11d48',
    "secondaryColor" TEXT NOT NULL DEFAULT '#111827',
    "socialLinksJson" TEXT NOT NULL DEFAULT '{}',
    "featureFlagsJson" TEXT NOT NULL DEFAULT '{}',
    "stripeAccountId" TEXT,
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "revenueShareRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDomain" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "type" "TenantDomainType" NOT NULL,
    "status" "TenantDomainStatus" NOT NULL DEFAULT 'PENDING',
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "tenantId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstallationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minDuration" INTEGER NOT NULL DEFAULT 1,
    "includesJson" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePublishableKeyHint" TEXT,
    "evolutionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "evolutionBaseUrl" TEXT,
    "evolutionInstance" TEXT,
    "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "bankName" TEXT,
    "account" TEXT,
    "clabe" TEXT,
    "beneficiary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultProjectType" TEXT NOT NULL,
    "defaultPrimaryColor" TEXT NOT NULL DEFAULT '#e11d48',
    "defaultSecondaryColor" TEXT NOT NULL DEFAULT '#111827',
    "defaultFeaturesJson" TEXT NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTemplatePackage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minDuration" INTEGER NOT NULL DEFAULT 1,
    "includesJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantTemplatePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTemplateMessage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantTemplateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantProvisioningJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "templateId" TEXT,
    "status" "ProvisioningJobStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "error" TEXT,
    "inputJson" TEXT NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantProvisioningJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantDomain_hostname_key" ON "TenantDomain"("hostname");

-- CreateIndex
CREATE INDEX "TenantDomain_tenantId_idx" ON "TenantDomain"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "ServicePackage_tenantId_idx" ON "ServicePackage"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationSettings_tenantId_key" ON "IntegrationSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BankSettings_tenantId_key" ON "BankSettings"("tenantId");

-- CreateIndex
CREATE INDEX "MessageTemplate_tenantId_idx" ON "MessageTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_tenantId_key_key" ON "MessageTemplate"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TenantTemplate_key_key" ON "TenantTemplate"("key");

-- CreateIndex
CREATE INDEX "TenantTemplatePackage_templateId_idx" ON "TenantTemplatePackage"("templateId");

-- CreateIndex
CREATE INDEX "TenantTemplateMessage_templateId_idx" ON "TenantTemplateMessage"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantTemplateMessage_templateId_key_key" ON "TenantTemplateMessage"("templateId", "key");

-- CreateIndex
CREATE INDEX "TenantProvisioningJob_tenantId_idx" ON "TenantProvisioningJob"("tenantId");

-- CreateIndex
CREATE INDEX "TenantProvisioningJob_templateId_idx" ON "TenantProvisioningJob"("templateId");

-- AddForeignKey
ALTER TABLE "TenantDomain" ADD CONSTRAINT "TenantDomain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackage" ADD CONSTRAINT "ServicePackage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSettings" ADD CONSTRAINT "IntegrationSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankSettings" ADD CONSTRAINT "BankSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplatePackage" ADD CONSTRAINT "TenantTemplatePackage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TenantTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplateMessage" ADD CONSTRAINT "TenantTemplateMessage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TenantTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProvisioningJob" ADD CONSTRAINT "TenantProvisioningJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProvisioningJob" ADD CONSTRAINT "TenantProvisioningJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TenantTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
