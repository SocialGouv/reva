-- CreateTable
CREATE TABLE "batch_execution" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" VARCHAR(255) NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "batch_execution_pkey" PRIMARY KEY ("id")
);
