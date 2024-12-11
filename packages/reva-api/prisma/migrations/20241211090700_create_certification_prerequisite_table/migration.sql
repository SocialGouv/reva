-- CreateTable
CREATE TABLE "certification_prerequisite" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" TEXT NOT NULL,
    "certification_id" UUID NOT NULL,

    CONSTRAINT "certification_prerequisite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certification_prerequisite" ADD CONSTRAINT "certification_prerequisite_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
