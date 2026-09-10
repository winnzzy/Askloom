ALTER TABLE "SavedOpportunity"
ADD COLUMN "platform" TEXT,
ADD COLUMN "assignee" TEXT,
ADD COLUMN "dueDate" DATE,
ADD COLUMN "selectedTitle" TEXT,
ADD COLUMN "publishedUrl" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "views" INTEGER,
ADD COLUMN "engagements" INTEGER,
ADD COLUMN "conversions" INTEGER;

CREATE INDEX "SavedOpportunity_userId_dueDate_idx" ON "SavedOpportunity"("userId", "dueDate");
