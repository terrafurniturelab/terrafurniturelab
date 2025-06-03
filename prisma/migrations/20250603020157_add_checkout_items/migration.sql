/*
  Warnings:

  - You are about to drop the column `productId` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Checkout` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Checkout" DROP CONSTRAINT "Checkout_productId_fkey";

-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "productId",
DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "CheckoutItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CheckoutItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckoutItem" ADD CONSTRAINT "CheckoutItem_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutItem" ADD CONSTRAINT "CheckoutItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
