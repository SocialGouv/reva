-- CreateTable
CREATE TABLE "basic_skill" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "basic_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_skill_candidacy" (
    "basic_skill_id" UUID NOT NULL,
    "candidacy_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "basic_skill_candidacy_pkey" PRIMARY KEY ("basic_skill_id","candidacy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "basic_skill_label_key" ON "basic_skill"("label");

-- AddForeignKey
ALTER TABLE "basic_skill_candidacy" ADD CONSTRAINT "basic_skill_candidacy_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_skill_candidacy" ADD CONSTRAINT "basic_skill_candidacy_basic_skill_id_fkey" FOREIGN KEY ("basic_skill_id") REFERENCES "basic_skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
