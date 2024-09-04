-- CreateEnum
CREATE TYPE "FormacodeType" AS ENUM ('DOMAIN', 'SUB_DOMAIN', 'KEYWORD');

-- CreateTable
CREATE TABLE "formacode" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "type" "FormacodeType" NOT NULL,
    "code" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "parent_code" TEXT,

    CONSTRAINT "formacode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formacode_code_key" ON "formacode"("code");

-- AddForeignKey
ALTER TABLE "formacode" ADD CONSTRAINT "formacode_parent_code_fkey" FOREIGN KEY ("parent_code") REFERENCES "formacode"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;
