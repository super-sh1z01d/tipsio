-- CreateEnum
CREATE TYPE "MenuJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "shortCode" TEXT;

-- CreateTable
CREATE TABLE "MenuDigitizationJob" (
    "id" TEXT NOT NULL,
    "status" "MenuJobStatus" NOT NULL DEFAULT 'QUEUED',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "rawOcrResponse" TEXT,
    "rawLlmResponse" TEXT,
    "imageUrls" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "venueId" TEXT NOT NULL,

    CONSTRAINT "MenuDigitizationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameOriginal" TEXT,
    "nameRu" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "venueId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT,
    "descriptionEn" TEXT,
    "descriptionRu" TEXT,
    "priceValue" INTEGER,
    "priceCurrency" TEXT NOT NULL DEFAULT 'IDR',
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "approxCalories" INTEGER,
    "isLocalSpecial" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "venueId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuDigitizationJob_venueId_idx" ON "MenuDigitizationJob"("venueId");

-- CreateIndex
CREATE INDEX "MenuDigitizationJob_status_idx" ON "MenuDigitizationJob"("status");

-- CreateIndex
CREATE INDEX "MenuDigitizationJob_isPublished_idx" ON "MenuDigitizationJob"("isPublished");

-- CreateIndex
CREATE INDEX "MenuCategory_venueId_idx" ON "MenuCategory"("venueId");

-- CreateIndex
CREATE INDEX "MenuCategory_jobId_idx" ON "MenuCategory"("jobId");

-- CreateIndex
CREATE INDEX "MenuCategory_order_idx" ON "MenuCategory"("order");

-- CreateIndex
CREATE INDEX "MenuItem_venueId_idx" ON "MenuItem"("venueId");

-- CreateIndex
CREATE INDEX "MenuItem_jobId_idx" ON "MenuItem"("jobId");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

-- CreateIndex
CREATE INDEX "MenuItem_order_idx" ON "MenuItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_shortCode_key" ON "Venue"("shortCode");

-- CreateIndex
CREATE INDEX "Venue_shortCode_idx" ON "Venue"("shortCode");

-- AddForeignKey
ALTER TABLE "MenuDigitizationJob" ADD CONSTRAINT "MenuDigitizationJob_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MenuDigitizationJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MenuDigitizationJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
