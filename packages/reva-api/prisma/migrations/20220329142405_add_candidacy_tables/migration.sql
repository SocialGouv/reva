-- CreateEnum
CREATE TYPE "CandidacyStatus" AS ENUM ('PROJET', 'VALIDATION', 'DOSSIER_PRO', 'CERTIFICATION');

-- CreateTable
CREATE TABLE "companion" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "companion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "deviceId" VARCHAR(255) NOT NULL,
    "keycloak_sub" UUID,
    "companion_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_candidacy_status" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "status" "CandidacyStatus" NOT NULL DEFAULT E'PROJET',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_candidacy_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_goal" (
    "candidacy_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "additional_information" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_goal_pkey" PRIMARY KEY ("candidacy_id","goal_id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "candidacy_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_deviceId_key" ON "candidacy"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "goal_label_key" ON "goal"("label");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "companion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_candidacy_status" ADD CONSTRAINT "candidacy_candidacy_status_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_goal" ADD CONSTRAINT "candidacy_goal_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_goal" ADD CONSTRAINT "candidacy_goal_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


CREATE TRIGGER set_companion_timestamp
BEFORE UPDATE ON companion
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_candidacy_timestamp
BEFORE UPDATE ON candidacy
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_candidacy_candidacy_status_timestamp
BEFORE UPDATE ON candidacy_candidacy_status
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_goal_timestamp
BEFORE UPDATE ON goal
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_candidacy_goal_timestamp
BEFORE UPDATE ON candidacy_goal
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_experience_timestamp
BEFORE UPDATE ON experience
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();