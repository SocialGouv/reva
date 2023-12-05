
-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "ccn_id" UUID;

-- CreateTable
CREATE TABLE "candidacy_convention_collective" (
    "id" UUID NOT NULL,
    "idcc" VARCHAR(10) NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "candidacy_convention_collective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_convention_collective_idcc_key" ON "candidacy_convention_collective"("idcc");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "candidacy_convention_collective"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE;
