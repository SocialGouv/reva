-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "highestDegreeLabel" VARCHAR(255),
ADD COLUMN     "niveau_de_formation_le_plus_eleve_degree_id" UUID;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_niveau_de_formation_le_plus_eleve_degree_id_fkey" FOREIGN KEY ("niveau_de_formation_le_plus_eleve_degree_id") REFERENCES "degree"("id") ON DELETE SET NULL ON UPDATE CASCADE;