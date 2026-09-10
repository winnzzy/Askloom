-- Add a lightweight content-production pipeline to saved opportunities.
ALTER TABLE "SavedOpportunity"
ADD COLUMN "contentStatus" TEXT NOT NULL DEFAULT 'IDEA';

CREATE INDEX "SavedOpportunity_userId_contentStatus_updatedAt_idx"
ON "SavedOpportunity"("userId", "contentStatus", "updatedAt");
