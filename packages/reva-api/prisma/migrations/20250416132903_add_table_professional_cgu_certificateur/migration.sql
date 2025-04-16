-- CreateTable
CREATE TABLE "professional_cgu_certificateur" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" SERIAL NOT NULL,

    CONSTRAINT "professional_cgu_certificateur_pkey" PRIMARY KEY ("id")
);
