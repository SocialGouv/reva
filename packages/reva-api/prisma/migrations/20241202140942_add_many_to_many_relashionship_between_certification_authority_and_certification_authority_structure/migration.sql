-- CreateTable
CREATE TABLE
    "certification_authority_on_certification_authority_structure" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "certification_authority_id" UUID NOT NULL,
        "certification_authority_structure_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "certification_authority_on_certification_authority_structu_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_on_certification_authority_structur_key" ON "certification_authority_on_certification_authority_structure" (
    "certification_authority_id",
    "certification_authority_structure_id"
);

-- AddForeignKey
ALTER TABLE "certification_authority_on_certification_authority_structure" ADD CONSTRAINT "ca_on_cas_ca" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_on_certification_authority_structure" ADD CONSTRAINT "ca_on_cas_cas" FOREIGN KEY ("certification_authority_structure_id") REFERENCES "certification_authority_structure" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate all existing certification_authority to certification_authority_on_certification_authority_structure relatuionships
INSERT INTO
    "certification_authority_on_certification_authority_structure" (
        "certification_authority_id",
        "certification_authority_structure_id"
    )
SELECT
    "id",
    "certification_authority_structure_id"
FROM
    "certification_authority";

-- Add certification_authority certification_authority_structure relationships based on certification_authorities certifications
INSERT INTO
    "certification_authority_on_certification_authority_structure" (
        "certification_authority_id",
        "certification_authority_structure_id"
    )
SELECT DISTINCT
    "certification_authority"."id",
    "certification"."certification_authority_structure_id"
FROM
    "certification_authority"
    JOIN "certification_authority_on_certification" ON "certification_authority_on_certification"."certification_authority_id" = "certification_authority"."id"
    JOIN "certification" ON "certification"."id" = "certification_authority_on_certification"."certification_id"
WHERE
    (
        "certification_authority"."id",
        "certification"."certification_authority_structure_id"
    ) NOT IN (
        SELECT
            "certification_authority_id",
            "certification_authority_structure_id"
        FROM
            "certification_authority_on_certification_authority_structure"
    );