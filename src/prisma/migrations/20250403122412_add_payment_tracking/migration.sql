-- AlterTable
ALTER TABLE `Lease` ADD COLUMN `totalPayments` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `paymentNumber` INTEGER NOT NULL DEFAULT 0;
