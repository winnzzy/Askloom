CREATE TABLE "StudioAsset" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "opportunityId" UUID,
  "projectId" UUID,
  "topic" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "audience" TEXT NOT NULL,
  "tone" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioAsset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StudioAsset_userId_createdAt_idx" ON "StudioAsset"("userId", "createdAt");
CREATE INDEX "StudioAsset_opportunityId_version_idx" ON "StudioAsset"("opportunityId", "version");
CREATE INDEX "StudioAsset_projectId_createdAt_idx" ON "StudioAsset"("projectId", "createdAt");
ALTER TABLE "StudioAsset" ADD CONSTRAINT "StudioAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioAsset" ADD CONSTRAINT "StudioAsset_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "SavedOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudioAsset" ADD CONSTRAINT "StudioAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
