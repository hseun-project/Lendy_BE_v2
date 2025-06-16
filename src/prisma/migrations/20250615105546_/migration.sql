/*
  Warnings:

  - You are about to drop the column `name` on the `Repayment` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Repayment` table. All the data in the column will be lost.
  - You are about to drop the column `bankId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repayment" DROP COLUMN "name",
DROP COLUMN "state";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bankId";
