-- CreateTable
CREATE TABLE "drop_out_reason" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "drop_out_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_drop_out" (
    "candidacy_id" UUID NOT NULL,
    "drop_out_reason_id" UUID NOT NULL,
    "status" "CandidacyStatus" NOT NULL,
    "dropped_out_at" TIMESTAMP(3) NOT NULL,
    "other_reason_content" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_drop_out_pkey" PRIMARY KEY ("candidacy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drop_out_reason_label_key" ON "drop_out_reason"("label");

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_drop_out_candidacy_id_key" ON "candidacy_drop_out"("candidacy_id");

-- AddForeignKey
ALTER TABLE "candidacy_drop_out" ADD CONSTRAINT "candidacy_drop_out_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_drop_out" ADD CONSTRAINT "candidacy_drop_out_drop_out_reason_id_fkey" FOREIGN KEY ("drop_out_reason_id") REFERENCES "drop_out_reason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
