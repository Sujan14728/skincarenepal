-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" SERIAL NOT NULL,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyLocation" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);
