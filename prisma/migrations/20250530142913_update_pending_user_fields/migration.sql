/*
  Warnings:

  - You are about to drop the column `nama` on the `pending_user` table. All the data in the column will be lost.
  - You are about to drop the column `pw` on the `pending_user` table. All the data in the column will be lost.
  - Added the required column `name` to the `pending_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `pending_user` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new columns
ALTER TABLE "pending_user" ADD COLUMN "name" TEXT;
ALTER TABLE "pending_user" ADD COLUMN "password" TEXT;

-- Copy data from old columns to new ones
UPDATE "pending_user" SET "name" = "nama", "password" = "pw";

-- Make the new columns required
ALTER TABLE "pending_user" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "pending_user" ALTER COLUMN "password" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "pending_user" DROP COLUMN "nama";
ALTER TABLE "pending_user" DROP COLUMN "pw";
