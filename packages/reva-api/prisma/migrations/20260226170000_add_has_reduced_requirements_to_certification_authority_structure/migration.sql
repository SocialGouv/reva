-- Add support for reduced certification requirements on SUP structures.
ALTER TABLE "certification_authority_structure"
ADD COLUMN "has_reduced_requirements" BOOLEAN NOT NULL DEFAULT false;
