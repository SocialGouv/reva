-- CreateTable
CREATE TABLE "training" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_candidacy" (
    "training_id" UUID NOT NULL,
    "candidacy_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "training_candidacy_pkey" PRIMARY KEY ("training_id","candidacy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_label_key" ON "training"("label");

-- AddForeignKey
ALTER TABLE "training_candidacy" ADD CONSTRAINT "training_candidacy_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_candidacy" ADD CONSTRAINT "training_candidacy_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
