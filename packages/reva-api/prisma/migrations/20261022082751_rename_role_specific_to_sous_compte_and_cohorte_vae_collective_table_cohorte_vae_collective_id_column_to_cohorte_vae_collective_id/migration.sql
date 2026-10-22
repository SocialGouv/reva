-- Renaming the column (instead of drop+add) to preserve existing data.
-- The FK constraint and unique index already reference this column by name
-- and keep the same names automatically after a PostgreSQL column rename,
-- so they don't need to be recreated.
ALTER TABLE "role_specific_to_sous_compte_and_cohorte_vae_collective" RENAME COLUMN "cohorteVaeCollectiveId" TO "cohorte_vae_collective_id";
