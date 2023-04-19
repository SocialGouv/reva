-- CreateTable
CREATE TABLE "organism_department" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organism_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "is_onsite" BOOLEAN NOT NULL DEFAULT false,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organism_department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organism_department_organism_id_department_id_key" ON "organism_department"("organism_id", "department_id");

-- AddForeignKey
ALTER TABLE "organism_department" ADD CONSTRAINT "organism_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_department" ADD CONSTRAINT "organism_department_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
