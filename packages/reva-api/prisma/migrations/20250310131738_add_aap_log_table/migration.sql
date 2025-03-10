-- CreateEnum
CREATE TYPE "AAPLogUserProfile" AS ENUM ('ADMIN', 'AAP');

-- CreateTable
CREATE TABLE "aap_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_keycloak_id" UUID NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "user_profile" "AAPLogUserProfile" NOT NULL,
    "maison_mere_aap_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "aap_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aap_log_maison_mere_aap_id_idx" ON "aap_log"("maison_mere_aap_id");

-- AddForeignKey
ALTER TABLE "aap_log" ADD CONSTRAINT "aap_log_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
