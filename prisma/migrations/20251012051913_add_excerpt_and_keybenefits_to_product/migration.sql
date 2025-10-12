-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "keyBenefits" TEXT[] DEFAULT ARRAY[]::TEXT[];
