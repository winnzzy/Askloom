CREATE TABLE "SearchSignalDaily" (
    "id" UUID NOT NULL,
    "signalDate" DATE NOT NULL,
    "normalizedSeed" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "sourcesKey" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "resultCountTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SearchSignalDaily_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductMetricDaily" (
    "id" UUID NOT NULL,
    "metricDate" DATE NOT NULL,
    "eventName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductMetricDaily_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SearchSignalDaily_signalDate_normalizedSeed_language_market_sourcesKey_key" ON "SearchSignalDaily"("signalDate", "normalizedSeed", "language", "market", "sourcesKey");
CREATE INDEX "SearchSignalDaily_normalizedSeed_signalDate_idx" ON "SearchSignalDaily"("normalizedSeed", "signalDate");
CREATE INDEX "SearchSignalDaily_market_language_signalDate_idx" ON "SearchSignalDaily"("market", "language", "signalDate");
CREATE UNIQUE INDEX "ProductMetricDaily_metricDate_eventName_language_market_platform_key" ON "ProductMetricDaily"("metricDate", "eventName", "language", "market", "platform");
CREATE INDEX "ProductMetricDaily_eventName_metricDate_idx" ON "ProductMetricDaily"("eventName", "metricDate");
CREATE INDEX "ProductMetricDaily_market_language_metricDate_idx" ON "ProductMetricDaily"("market", "language", "metricDate");
