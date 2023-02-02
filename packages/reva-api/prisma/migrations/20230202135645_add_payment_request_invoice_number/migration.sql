/*
  Warnings:

  - Added the required column `invoice_number` to the `payment_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_request" ADD COLUMN     "invoice_number" TEXT NOT NULL;
