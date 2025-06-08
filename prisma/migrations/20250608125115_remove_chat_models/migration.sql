/*
  Warnings:

  - You are about to drop the `AdminMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminMessage" DROP CONSTRAINT "AdminMessage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_productId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserMessage" DROP CONSTRAINT "UserMessage_chatId_fkey";

-- DropTable
DROP TABLE "AdminMessage";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "UserMessage";
