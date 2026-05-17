-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "model" TEXT NOT NULL,
    "settings" JSONB,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generations_parentId_idx" ON "generations"("parentId");

-- CreateIndex
CREATE INDEX "generations_status_idx" ON "generations"("status");

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
