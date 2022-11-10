-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "region_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_label_key" ON "department"("label");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
