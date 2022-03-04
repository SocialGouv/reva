CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE "certification" (
    "id" UUID DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rncp_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profession" (
    "id" UUID DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rome_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "profession_pkey" PRIMARY KEY ("id")
);

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