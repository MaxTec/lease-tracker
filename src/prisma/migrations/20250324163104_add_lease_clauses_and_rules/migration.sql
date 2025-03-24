-- CreateTable
CREATE TABLE `LeaseClause` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `type` ENUM('PAYMENT', 'MAINTENANCE', 'TERMINATION', 'SECURITY_DEPOSIT', 'UTILITIES', 'INSURANCE', 'OTHER') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeasesToClauses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `clauseId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LeasesToClauses_leaseId_clauseId_key`(`leaseId`, `clauseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('PETS', 'SMOKING', 'NOISE', 'GUESTS', 'PARKING', 'MAINTENANCE', 'ALTERATIONS', 'OTHER') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeasesToRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaseId` INTEGER NOT NULL,
    `ruleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LeasesToRules_leaseId_ruleId_key`(`leaseId`, `ruleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LeasesToClauses` ADD CONSTRAINT `LeasesToClauses_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeasesToClauses` ADD CONSTRAINT `LeasesToClauses_clauseId_fkey` FOREIGN KEY (`clauseId`) REFERENCES `LeaseClause`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeasesToRules` ADD CONSTRAINT `LeasesToRules_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeasesToRules` ADD CONSTRAINT `LeasesToRules_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `LeaseRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
