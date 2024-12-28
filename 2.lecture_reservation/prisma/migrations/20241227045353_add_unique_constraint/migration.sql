/*
  Warnings:

  - A unique constraint covering the columns `[lectureId,userId]` on the table `reservations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `reservations_userId_idx` ON `reservations`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `reservations_lectureId_userId_key` ON `reservations`(`lectureId`, `userId`);
