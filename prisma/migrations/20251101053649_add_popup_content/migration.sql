-- CreateTable
CREATE TABLE "PopupContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopupContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupDetails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "popupContentId" INTEGER NOT NULL,

    CONSTRAINT "PopupDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PopupDetails" ADD CONSTRAINT "PopupDetails_popupContentId_fkey" FOREIGN KEY ("popupContentId") REFERENCES "PopupContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
