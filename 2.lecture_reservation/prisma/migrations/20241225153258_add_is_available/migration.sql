/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `lectures` DROP FOREIGN KEY `lectures_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `reservations` DROP FOREIGN KEY `reservations_userId_fkey`;

-- DropIndex
DROP INDEX `lectures_instructorId_fkey` ON `lectures`;

-- DropIndex
DROP INDEX `reservations_userId_fkey` ON `reservations`;

-- AlterTable
ALTER TABLE `lectures` ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `users`;
