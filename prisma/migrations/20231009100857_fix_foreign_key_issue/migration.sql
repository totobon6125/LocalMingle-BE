-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_EventId_fkey`;

-- AlterTable
ALTER TABLE `Category` MODIFY `EventId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE SET NULL ON UPDATE CASCADE;
