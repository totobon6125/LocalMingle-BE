-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInfo` (
    `userDetailId` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `intro` VARCHAR(191) NULL,
    `profileImg` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserInfo_nickname_key`(`nickname`),
    PRIMARY KEY (`userDetailId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `eventId` INTEGER NOT NULL AUTO_INCREMENT,
    `eventName` VARCHAR(191) NOT NULL,
    `maxSize` INTEGER NOT NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `signupStartDate` DATETIME(3) NOT NULL,
    `signupEndDate` DATETIME(3) NOT NULL,
    `eventLocation` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`eventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Viewlog` (
    `viewlogId` INTEGER NOT NULL AUTO_INCREMENT,
    `EventId` INTEGER NOT NULL,
    `UserId` INTEGER NOT NULL,

    PRIMARY KEY (`viewlogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HostEvent` (
    `hostEventId` INTEGER NOT NULL AUTO_INCREMENT,
    `HostId` INTEGER NOT NULL,
    `EventId` INTEGER NOT NULL,

    PRIMARY KEY (`hostEventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestEvent` (
    `guestEventId` INTEGER NOT NULL AUTO_INCREMENT,
    `GuestId` INTEGER NULL,
    `EventId` INTEGER NOT NULL,

    PRIMARY KEY (`guestEventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Region` (
    `RegionId` INTEGER NOT NULL AUTO_INCREMENT,
    `doName` VARCHAR(191) NOT NULL,
    `guName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`RegionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInfo` ADD CONSTRAINT `UserInfo_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Viewlog` ADD CONSTRAINT `Viewlog_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Viewlog` ADD CONSTRAINT `Viewlog_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `UserInfo`(`userDetailId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostEvent` ADD CONSTRAINT `HostEvent_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HostEvent` ADD CONSTRAINT `HostEvent_HostId_fkey` FOREIGN KEY (`HostId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestEvent` ADD CONSTRAINT `GuestEvent_EventId_fkey` FOREIGN KEY (`EventId`) REFERENCES `Event`(`eventId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestEvent` ADD CONSTRAINT `GuestEvent_GuestId_fkey` FOREIGN KEY (`GuestId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
