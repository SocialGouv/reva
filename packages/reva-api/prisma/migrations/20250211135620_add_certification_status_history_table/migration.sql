-- CreateTable
CREATE TABLE "certification_status_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_id" UUID NOT NULL,
    "status" "CertificationStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_status_history_pkey" PRIMARY KEY ("id")
);
