-- AlterTable: add toAccountId to Transaction
ALTER TABLE `Transaction` ADD COLUMN `toAccountId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_toAccountId_fkey` FOREIGN KEY (`toAccountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: unique constraint on Budget
CREATE UNIQUE INDEX `Budget_userId_categoryId_month_year_key` ON `Budget`(`userId`, `categoryId`, `month`, `year`);
