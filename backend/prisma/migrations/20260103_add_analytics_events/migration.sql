-- CreateEnum for event types
CREATE TYPE "AnalyticsEventType" AS ENUM ('QR_SCAN', 'MENU_VIEW', 'CATEGORY_VIEW', 'PRODUCT_VIEW', 'SEARCH', 'CONTACT_CLICK', 'DIRECTION_CLICK');

-- CreateEnum for analytics source
CREATE TYPE "AnalyticsSource" AS ENUM ('QR', 'DIRECT', 'SOCIAL', 'OTHER');

-- CreateEnum for device type  
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET');

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "eventType" "AnalyticsEventType" NOT NULL,
    "pagePath" TEXT,
    "categoryId" TEXT,
    "productId" TEXT,
    "tableNo" TEXT,
    "source" "AnalyticsSource",
    "deviceType" "DeviceType" NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_restaurantId_createdAt_idx" ON "analytics_events"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_visitorId_idx" ON "analytics_events"("visitorId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
