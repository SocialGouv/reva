-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "feasibility_file_resource_first_read_at",
ADD COLUMN     "feasibility_file_demat_autonome_first_opening_at" TIMESTAMPTZ(6),
ADD COLUMN     "feasibility_file_demat_autonome_resource_hidden_at" TIMESTAMPTZ(6);
