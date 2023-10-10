/*
  Warnings:

  - You are about to drop the column `CategoryId` on the `Event` table. All the data in the column will be lost.
  - The primary key for the `GuestEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GuestEvent` table. All the data in the column will be lost.
  - The primary key for the `HostEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `HostEvent` table. All the data in the column will be lost.
  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestEventId` to the `GuestEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostEventId` to the `HostEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_EventId_fkey`;

-- DropForeignKey
ALTER TABLE `GuestEvent` DROP FOREIGN KEY `GuestEvent_EventId_fkey`;

-- DropForeignKey
ALTER TABLE `GuestEvent` DROP FOREIGN KEY `GuestEvent_GuestId_fkey`;

-- DropForeignKey
ALTER TABLE `HostEvent` DROP FOREIGN KEY `HostEvent_EventId_fkey`;

-- DropForeignKey
ALTER TABLE `HostEvent` DROP FOREIGN KEY `HostEvent_HostId_fkey`;

-- DropForeignKey
ALTER TABLE `UserInfo` DROP FOREIGN KEY `UserInfo_UserId_fkey`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `CategoryId`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `GuestEvent` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `guestEventId` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `GuestId` INTEGER NULL,
    ADD PRIMARY KEY (`guestEventId`);

-- AlterTable
ALTER TABLE `HostEvent` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `hostEventId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`hostEventId`);

-- CreateTable
CREATE TABLE `Viewlog` (
    `viewlogId` INTEGER NOT NULL AUTO_INCREMENT,
    `EventId` INTEGER NOT NULL,
    `UserId` INTEGER NOT NULL,

    PRIMARY KEY (`viewlogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInfo` ADD CONSTRAINT `UserInfo_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Viewlog` ADD CONSTRAINT `Viewlog_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Viewlog` ADD CONSTRAINT `Viewlog_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `UserInfo`(`userDetailId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostEvent` ADD CONSTRAINT `HostEvent_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostEvent` ADD CONSTRAINT `HostEvent_HostId_fkey` FOREIGN KEY (`HostId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestEvent` ADD CONSTRAINT `GuestEvent_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestEvent` ADD CONSTRAINT `GuestEvent_GuestId_fkey` FOREIGN KEY (`GuestId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
