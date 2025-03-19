-- AlterTable
ALTER TABLE `User` 
    MODIFY `password` VARCHAR(191) NULL,  -- Make password nullable
    ADD `isActive` BOOLEAN NOT NULL DEFAULT false;  -- Add isActive field 