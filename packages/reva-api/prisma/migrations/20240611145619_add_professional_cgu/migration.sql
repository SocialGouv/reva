-- CreateTable
CREATE TABLE "professional_cgu" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "professional_cgu_pkey" PRIMARY KEY ("id")
);
