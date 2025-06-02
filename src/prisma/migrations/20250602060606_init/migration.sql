-- CreateEnum
CREATE TYPE "ApplyType" AS ENUM ('PRIVATE_LOAN', 'PUBLIC_LOAN');

-- CreateEnum
CREATE TYPE "DuringType" AS ENUM ('DAY', 'MONTH');

-- CreateEnum
CREATE TYPE "RequestLoanState" AS ENUM ('PENDING', 'APPROVAL', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoanState" AS ENUM ('ACTIVE', 'COMPLETE');

-- CreateTable
CREATE TABLE "Bank" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "bankId" BIGINT,
    "email" VARCHAR(32) NOT NULL,
    "password" TEXT NOT NULL,
    "creditScore" INTEGER NOT NULL DEFAULT 500,
    "name" VARCHAR(10),
    "bankNumber" VARCHAR(20),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplyLoan" (
    "id" BIGSERIAL NOT NULL,
    "debtId" BIGINT NOT NULL,
    "bondId" BIGINT,
    "applyType" "ApplyType" NOT NULL,
    "money" INTEGER NOT NULL,
    "interest" DECIMAL(4,2) NOT NULL,
    "duringType" "DuringType" NOT NULL,
    "during" INTEGER NOT NULL,
    "state" "RequestLoanState" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ApplyLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" BIGSERIAL NOT NULL,
    "debtId" BIGINT NOT NULL,
    "bondId" BIGINT NOT NULL,
    "money" INTEGER NOT NULL,
    "interest" DECIMAL(4,2) NOT NULL,
    "duringType" "DuringType" NOT NULL,
    "during" INTEGER NOT NULL,
    "startDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" "LoanState" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" BIGSERIAL NOT NULL,
    "loanId" BIGINT NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "repayDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repayInterest" INTEGER NOT NULL,
    "repayMoney" INTEGER NOT NULL,
    "state" "RequestLoanState" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplyLoan" ADD CONSTRAINT "ApplyLoan_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplyLoan" ADD CONSTRAINT "ApplyLoan_bondId_fkey" FOREIGN KEY ("bondId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bondId_fkey" FOREIGN KEY ("bondId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
