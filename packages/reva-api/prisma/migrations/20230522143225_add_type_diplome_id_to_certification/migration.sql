ALTER TABLE "certification" ADD COLUMN     "type_diplome_id" UUID;
ALTER TABLE "certification" ADD CONSTRAINT "certification_type_diplome_id_fkey" FOREIGN KEY ("type_diplome_id") REFERENCES "type_diplome"("id") ON DELETE SET NULL ON UPDATE CASCADE;
