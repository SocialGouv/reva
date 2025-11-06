-- CreateTable
CREATE TABLE
    "maison_mere_aap_on_account" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "maison_mere_aap_id" UUID NOT NULL,
        "account_id" UUID NOT NULL,
        CONSTRAINT "maison_mere_aap_on_account_pkey" PRIMARY KEY ("id")
    );

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_account" ADD CONSTRAINT "maison_mere_aap_on_account_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_account" ADD CONSTRAINT "maison_mere_aap_on_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;