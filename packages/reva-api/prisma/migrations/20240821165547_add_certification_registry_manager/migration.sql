-- CreateTable
CREATE TABLE "certification_registry_manager" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "account_id" UUID NOT NULL,
    "certification_authority_structure_id" UUID NOT NULL,

    CONSTRAINT "certification_registry_manager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_registry_manager_certification_authority_stru_key" ON "certification_registry_manager"("certification_authority_structure_id");

-- CreateIndex
CREATE INDEX "certification_registry_manager_account_id_idx" ON "certification_registry_manager"("account_id");

-- CreateIndex
CREATE INDEX "certification_registry_manager_certification_authority_stru_idx" ON "certification_registry_manager"("certification_authority_structure_id");

-- AddForeignKey
ALTER TABLE "certification_registry_manager" ADD CONSTRAINT "certification_registry_manager_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_registry_manager" ADD CONSTRAINT "certification_registry_manager_certification_authority_str_fkey" FOREIGN KEY ("certification_authority_structure_id") REFERENCES "certification_authority_structure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
