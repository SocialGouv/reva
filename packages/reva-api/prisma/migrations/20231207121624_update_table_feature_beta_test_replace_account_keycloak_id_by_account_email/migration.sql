DELETE FROM "feature_beta_test";

-- DropForeignKey
ALTER TABLE "feature_beta_test" DROP CONSTRAINT "feature_beta_test_account_keycloak_id_fkey";

-- AlterTable
ALTER TABLE "feature_beta_test" DROP COLUMN "account_keycloak_id",
ADD COLUMN     "account_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "feature_beta_test" ADD CONSTRAINT "feature_beta_test_account_email_fkey" FOREIGN KEY ("account_email") REFERENCES "account"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
