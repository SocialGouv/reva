-- AlterTable
CREATE SEQUENCE professional_cgu_version_seq;
ALTER TABLE "professional_cgu" ALTER COLUMN "version" SET DEFAULT nextval('professional_cgu_version_seq');
ALTER SEQUENCE professional_cgu_version_seq OWNED BY "professional_cgu"."version";
