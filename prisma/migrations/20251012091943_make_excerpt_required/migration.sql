-- Fill NULLs
UPDATE "Product" SET "excerpt" = '' WHERE "excerpt" IS NULL;

-- Make column required
ALTER TABLE "Product" ALTER COLUMN "excerpt" SET NOT NULL;