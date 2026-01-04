-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'TRIAL', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('DEMO', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PassiveReason" AS ENUM ('EXPIRED', 'MANUAL', 'PAYMENT_FAILED', 'DEMO_ENDED', 'OTHER');

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "plan" "MembershipPlan" NOT NULL DEFAULT 'DEMO',
    "status" "MembershipStatus" NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "passiveDate" TIMESTAMP(3),
    "passiveReason" "PassiveReason",
    "lastActivity" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memberships_restaurantId_key" ON "memberships"("restaurantId");

-- CreateIndex
CREATE INDEX "memberships_status_idx" ON "memberships"("status");

-- CreateIndex
CREATE INDEX "memberships_plan_idx" ON "memberships"("plan");

-- CreateIndex
CREATE INDEX "memberships_endDate_idx" ON "memberships"("endDate");

-- CreateIndex
CREATE INDEX "memberships_restaurantId_status_idx" ON "memberships"("restaurantId", "status");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
