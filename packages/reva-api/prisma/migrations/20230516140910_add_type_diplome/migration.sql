-- CreateTable
CREATE TABLE "type_diplome" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(200) NOT NULL,

    CONSTRAINT "type_diplome_pkey" PRIMARY KEY ("id")
);
