-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('RENDEZ_VOUS_PEDAGOGIQUE');

-- CreateTable
CREATE TABLE
    "appointment" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "type" "AppointmentType" NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "date" DATE NOT NULL,
        "location" TEXT,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        "candidacy_id" UUID NOT NULL,
        CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
    );

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy" ("id") ON DELETE CASCADE ON UPDATE CASCADE;