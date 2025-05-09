-- AlterTable
ALTER TABLE `User` ADD COLUMN `registrationToken` VARCHAR(191) NULL,
    ADD COLUMN `registrationTokenExpires` DATETIME(3) NULL;
