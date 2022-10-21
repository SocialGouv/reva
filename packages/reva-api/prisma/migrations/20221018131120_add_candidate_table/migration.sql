-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "candidate_id" UUID;

-- CreateTable
CREATE TABLE "candidate" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "keycloak_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstname" VARCHAR(255),
    "lastname" VARCHAR(255),
    "phone" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_keycloak_id_key" ON "candidate"("keycloak_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_email_key" ON "candidate"("email");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
