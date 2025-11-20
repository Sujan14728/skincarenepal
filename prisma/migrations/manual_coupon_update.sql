-- Manual migration to update Coupon table structure
-- Run this on production database

-- Step 1: Add new columns
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "discountType" TEXT;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "discountValue" INTEGER;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "minPurchase" INTEGER;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "productId" INTEGER;

-- Step 2: Migrate data from old columns to new columns
UPDATE "Coupon" SET 
  "discountType" = CASE WHEN "isPercentage" = true THEN 'PERCENTAGE' ELSE 'FIXED' END,
  "discountValue" = "discountAmount",
  "isActive" = "active"
WHERE "discountType" IS NULL;

-- Step 3: Make discountType and discountValue NOT NULL (after data migration)
ALTER TABLE "Coupon" ALTER COLUMN "discountType" SET NOT NULL;
ALTER TABLE "Coupon" ALTER COLUMN "discountValue" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "Coupon" DROP COLUMN IF EXISTS "discountAmount";
ALTER TABLE "Coupon" DROP COLUMN IF EXISTS "isPercentage";
ALTER TABLE "Coupon" DROP COLUMN IF EXISTS "active";

-- Step 5: Add foreign key for productId if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Coupon_productId_fkey'
  ) THEN
    ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 6: Update validFrom to have default value for existing records
UPDATE "Coupon" SET "validFrom" = COALESCE("validFrom", CURRENT_TIMESTAMP) WHERE "validFrom" IS NULL;
ALTER TABLE "Coupon" ALTER COLUMN "validFrom" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Coupon" ALTER COLUMN "validFrom" SET NOT NULL;
