-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "howToUse" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "keyIngredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "suitableFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "excerpt" SET DEFAULT '';
