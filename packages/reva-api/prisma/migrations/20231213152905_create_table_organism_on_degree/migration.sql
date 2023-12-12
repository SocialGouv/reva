-- CreateTable
CREATE TABLE "organism_on_degree" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organism_id" UUID NOT NULL,
    "degree_id" UUID NOT NULL,

    CONSTRAINT "organism_on_degree_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organism_on_degree" ADD CONSTRAINT "organism_on_degree_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_degree" ADD CONSTRAINT "organism_on_degree_degree_id_fkey" FOREIGN KEY ("degree_id") REFERENCES "degree"("id") ON DELETE CASCADE ON UPDATE CASCADE;
