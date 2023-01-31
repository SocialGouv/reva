-- CreateTable
CREATE TABLE "activity" (
    "code_ogr" VARCHAR(255) NOT NULL,
    "label" TEXT NOT NULL,
    "label_type_activity" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "activity_pkey" PRIMARY KEY ("code_ogr")
);

-- CreateTable
CREATE TABLE "activity_rome" (
    "activity_code_ogr" TEXT NOT NULL,
    "rome_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "activity_rome_pkey" PRIMARY KEY ("activity_code_ogr","rome_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_code_ogr_key" ON "activity"("code_ogr");

-- AddForeignKey
ALTER TABLE "activity_rome" ADD CONSTRAINT "activity_rome_activity_code_ogr_fkey" FOREIGN KEY ("activity_code_ogr") REFERENCES "activity"("code_ogr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_rome" ADD CONSTRAINT "activity_rome_rome_code_fkey" FOREIGN KEY ("rome_code") REFERENCES "rome"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
