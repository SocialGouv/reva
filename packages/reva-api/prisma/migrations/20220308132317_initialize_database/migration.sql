CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTable
CREATE TABLE "certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rncp_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profession" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "rome_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "profession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rome" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "rome_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "profession" ADD CONSTRAINT "profession_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TRIGGER set_certification_timestamp
BEFORE UPDATE ON certification
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_profession_timestamp
BEFORE UPDATE ON profession
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE MATERIALIZED VIEW "certification_search" AS
    SELECT certification.id,
        certification.slug,
        setweight(to_tsvector(certification.slug::text), 'A'::"char") AS document
    FROM certification
    WHERE certification.is_active
    GROUP BY certification.id;


CREATE MATERIALIZED VIEW "profession_search" AS
    SELECT profession.id,
        profession.slug,
        setweight(to_tsvector(profession.slug::text), 'A'::"char") AS document
    FROM profession
    GROUP BY profession.id;