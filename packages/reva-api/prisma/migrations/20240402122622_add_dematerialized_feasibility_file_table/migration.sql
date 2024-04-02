-- CreateTable
CREATE TABLE "dematerialized_feasibility_file" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "first_foreign_language" TEXT,
    "second_foreign_language" TEXT,
    "option" TEXT,

    CONSTRAINT "dematerialized_feasibility_file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
