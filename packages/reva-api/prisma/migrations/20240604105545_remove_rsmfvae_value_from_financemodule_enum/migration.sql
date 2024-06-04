/*
  Warnings:

  - The values [rsmfvae] on the enum `FinanceModule` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FinanceModule_new" AS ENUM ('unireva', 'unifvae');
ALTER TABLE "candidacy" ALTER COLUMN "finance_module" DROP DEFAULT;
ALTER TABLE "candidacy" ALTER COLUMN "finance_module" TYPE "FinanceModule_new" USING ("finance_module"::text::"FinanceModule_new");
ALTER TYPE "FinanceModule" RENAME TO "FinanceModule_old";
ALTER TYPE "FinanceModule_new" RENAME TO "FinanceModule";
DROP TYPE "FinanceModule_old";
ALTER TABLE "candidacy" ALTER COLUMN "finance_module" SET DEFAULT 'unifvae';
COMMIT;
