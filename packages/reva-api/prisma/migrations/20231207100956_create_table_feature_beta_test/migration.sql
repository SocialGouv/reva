-- CreateTable
CREATE TABLE "feature_beta_test" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "account_keycloak_id" UUID NOT NULL,
    "feature_key" TEXT NOT NULL,

    CONSTRAINT "feature_beta_test_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feature_beta_test" ADD CONSTRAINT "feature_beta_test_account_keycloak_id_fkey" FOREIGN KEY ("account_keycloak_id") REFERENCES "account"("keycloak_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_beta_test" ADD CONSTRAINT "feature_beta_test_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "features"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
