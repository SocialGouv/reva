-- CreateTable
CREATE TABLE "certification_authority" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(200) NOT NULL,
    "contact_full_name" VARCHAR(200),
    "contact_email" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "certification_authority_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "certification_authority_on_department" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "certification_authority_on_department_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "certification_authority_on_certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "certification_authority_on_certification_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_on_department_certification_authori_key" ON "certification_authority_on_department"("certification_authority_id", "department_id");
-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_on_certification_certification_auth_key" ON "certification_authority_on_certification"("certification_authority_id", "certification_id");
-- AddForeignKey
ALTER TABLE "certification_authority_on_department"
ADD CONSTRAINT "certification_authority_on_department_certification_author_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "certification_authority_on_department"
ADD CONSTRAINT "certification_authority_on_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "certification_authority_on_certification"
ADD CONSTRAINT "certification_authority_on_certification_certification_aut_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "certification_authority_on_certification"
ADD CONSTRAINT "certification_authority_on_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;