-- CreateTable
CREATE TABLE
    "organism_on_account" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "account_id" UUID NOT NULL,
        "organism_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "organism_on_account_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "organism_on_account_account_id_organism_id_key" ON "organism_on_account" ("account_id", "organism_id");

-- AddForeignKey
ALTER TABLE "organism_on_account" ADD CONSTRAINT "organism_on_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_account" ADD CONSTRAINT "organism_on_account_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;