/*
  Warnings:

  - The values [COMPLETE] on the enum `LoanState` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPROVAL] on the enum `RequestLoanState` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `name` on the `Bank` table. All the data in the column will be lost.
  - You are about to drop the column `bankNumber` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiTranId` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankNumber` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankNumberMasked` to the `Bank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LoanState_new" AS ENUM ('ACTIVE', 'COMPLETED');
ALTER TABLE "Loan" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Loan" ALTER COLUMN "state" TYPE "LoanState_new" USING ("state"::text::"LoanState_new");
ALTER TYPE "LoanState" RENAME TO "LoanState_old";
ALTER TYPE "LoanState_new" RENAME TO "LoanState";
DROP TYPE "LoanState_old";
ALTER TABLE "Loan" ALTER COLUMN "state" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestLoanState_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "ApplyLoan" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Repayment" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "ApplyLoan" ALTER COLUMN "state" TYPE "RequestLoanState_new" USING ("state"::text::"RequestLoanState_new");
ALTER TABLE "Repayment" ALTER COLUMN "state" TYPE "RequestLoanState_new" USING ("state"::text::"RequestLoanState_new");
ALTER TYPE "RequestLoanState" RENAME TO "RequestLoanState_old";
ALTER TYPE "RequestLoanState_new" RENAME TO "RequestLoanState";
DROP TYPE "RequestLoanState_old";
ALTER TABLE "ApplyLoan" ALTER COLUMN "state" SET DEFAULT 'PENDING';
ALTER TABLE "Repayment" ALTER COLUMN "state" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_bankId_fkey";

-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "name",
ADD COLUMN     "alias" VARCHAR(50) NOT NULL,
ADD COLUMN     "apiTranId" VARCHAR(40) NOT NULL,
ADD COLUMN     "bankName" VARCHAR(20) NOT NULL,
ADD COLUMN     "bankNumber" VARCHAR(20) NOT NULL,
ADD COLUMN     "bankNumberMasked" VARCHAR(20) NOT NULL,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bankNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Bank_userId_key" ON "Bank"("userId");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
