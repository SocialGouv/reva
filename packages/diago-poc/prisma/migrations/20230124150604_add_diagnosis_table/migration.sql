-- CreateTable
CREATE TABLE "diagnosis" (
    "id" SERIAL NOT NULL,
    "reva_identifier" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "diagnosis_pkey" PRIMARY KEY ("id")
);
