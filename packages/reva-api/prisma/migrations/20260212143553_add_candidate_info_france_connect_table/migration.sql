-- CreateTable
CREATE TABLE "candidate_info_france_connect" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidate_id" UUID NOT NULL,
    "country_id" UUID,
    "birthdate" DATE,
    "gender" "Gender",
    "given_name" VARCHAR(255),
    "firstname" VARCHAR(255),
    "firstname2" VARCHAR(255),
    "firstname3" VARCHAR(255),
    "lastname" VARCHAR(255),
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidate_info_france_connect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_info_france_connect_candidate_id_key" ON "candidate_info_france_connect"("candidate_id");

-- AddForeignKey
ALTER TABLE "candidate_info_france_connect" ADD CONSTRAINT "candidate_info_france_connect_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_info_france_connect" ADD CONSTRAINT "candidate_info_france_connect_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
