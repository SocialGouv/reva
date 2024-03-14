-- AlterTable
ALTER TABLE "candidate" DROP COLUMN "securite_sociale_number",
DROP COLUMN "usename",
ADD COLUMN     "givenName" VARCHAR(255),
ADD COLUMN     "social_security_number" VARCHAR(255);