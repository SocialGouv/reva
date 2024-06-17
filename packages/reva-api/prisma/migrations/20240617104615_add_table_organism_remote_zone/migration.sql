-- CreateEnum
CREATE TYPE "RemoteZone" AS ENUM (
    'FRANCE_METROPOLITAINE',
    'GUADELOUPE',
    'GUYANE',
    'MARTINIQUE',
    'MAYOTTE',
    'LA_REUNION'
);

-- CreateTable
CREATE TABLE
    "organism_on_remote_zone" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "organism_id" UUID NOT NULL,
        "remote_zone" "RemoteZone" NOT NULL,
        CONSTRAINT "organism_on_remote_zone_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE INDEX "organism_on_remote_zone_remote_zone_idx" ON "organism_on_remote_zone" ("remote_zone");

-- CreateIndex
CREATE UNIQUE INDEX "organism_on_remote_zone_organism_id_remote_zone_key" ON "organism_on_remote_zone" ("organism_id", "remote_zone");

-- AddForeignKey
ALTER TABLE "organism_on_remote_zone" ADD CONSTRAINT "organism_on_remote_zone_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism" ("id") ON DELETE CASCADE ON UPDATE CASCADE;