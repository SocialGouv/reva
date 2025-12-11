-- CreateTable
CREATE TABLE "candidacy_candidate_info" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "street" VARCHAR(255),
    "city" VARCHAR(255),
    "zip" VARCHAR(5),
    "address_complement" VARCHAR(255),

    CONSTRAINT "candidacy_candidate_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_candidate_info_candidacy_id_key" ON "candidacy_candidate_info"("candidacy_id");

-- AddForeignKey
ALTER TABLE "candidacy_candidate_info" ADD CONSTRAINT "candidacy_candidate_info_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


INSERT INTO "candidacy_candidate_info" ("candidacy_id", "street", "city", "zip", "address_complement")
SELECT "candidacy"."id", "candidate"."street", "candidate"."city", "candidate"."zip", "candidate"."addressComplement"
FROM "candidacy"
JOIN "candidate" ON "candidacy"."candidate_id" = "candidate"."id";
