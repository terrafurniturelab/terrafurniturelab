/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];
