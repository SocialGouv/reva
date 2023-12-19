-- CreateTable
CREATE TABLE "certification_authority_local_account" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "account_id" UUID NOT NULL,
    "certification_authority_id" UUID NOT NULL,

    CONSTRAINT "certification_authority_local_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_authority_local_account_on_certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_local_account_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_authority_local_account_on_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_authority_local_account_on_department" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_local_account_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_authority_local_account_on_department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_local_account_on_certification_cert_key" ON "certification_authority_local_account_on_certification"("certification_authority_local_account_id", "certification_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_local_account_on_department_certifi_key" ON "certification_authority_local_account_on_department"("certification_authority_local_account_id", "department_id");

-- AddForeignKey
ALTER TABLE "certification_authority_local_account" ADD CONSTRAINT "certification_authority_local_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account" ADD CONSTRAINT "certification_authority_local_account_certification_author_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_certification" ADD CONSTRAINT "certification_authority_local_account_on_certification_cer_fkey" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_certification" ADD CONSTRAINT "calaoc_certification" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_department" ADD CONSTRAINT "certification_authority_local_account_on_department_certif_fkey" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_department" ADD CONSTRAINT "calaoc_department" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
