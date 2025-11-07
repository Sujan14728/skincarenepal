/*
  Warnings:

  - You are about to drop the column `companyEmail` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `companyPhone` on the `CompanyInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyInfo" DROP COLUMN "companyEmail",
DROP COLUMN "companyPhone",
ADD COLUMN     "companyEmails" TEXT[],
ADD COLUMN     "companyPhones" TEXT[];
