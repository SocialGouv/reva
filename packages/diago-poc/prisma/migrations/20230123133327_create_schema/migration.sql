-- CreateTable
CREATE TABLE "certification" (
    "id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "rncp_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_bloc" (
    "id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "bloc_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "skill_bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rome" (
    "id" INTEGER NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "rome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rome_certification" (
    "certification_id" INTEGER NOT NULL,
    "rome_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "rome_certification_pkey" PRIMARY KEY ("certification_id","rome_id")
);

-- CreateTable
CREATE TABLE "profession" (
    "id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "rome_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "profession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_rncp_id_key" ON "certification"("rncp_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_bloc_bloc_id_key" ON "skill_bloc"("bloc_id");

-- CreateIndex
CREATE UNIQUE INDEX "rome_code_key" ON "rome"("code");

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profession" ADD CONSTRAINT "profession_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
