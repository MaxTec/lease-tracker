/*
  Warnings:

  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'LANDLORD', 'TENANT') NOT NULL DEFAULT 'TENANT';
