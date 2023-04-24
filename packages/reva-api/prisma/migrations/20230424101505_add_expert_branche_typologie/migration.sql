-- CreateTable
CREATE TABLE "organism_on_ccn" (
    "ccn_id" UUID NOT NULL,
    "organism_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organism_on_ccn_pkey" PRIMARY KEY ("ccn_id","organism_id")
);

-- CreateTable
CREATE TABLE "certification_on_ccn" (
    "ccn_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_on_ccn_pkey" PRIMARY KEY ("ccn_id","certification_id")
);

-- CreateTable
CREATE TABLE "subscription_request_on_ccn" (
    "ccn_id" UUID NOT NULL,
    "subscription_request_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "subscription_request_on_ccn_pkey" PRIMARY KEY ("ccn_id","subscription_request_id")
);

-- CreateTable
CREATE TABLE "convention_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "ccid" VARCHAR(10) NOT NULL,

    CONSTRAINT "convention_collective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convention_collective_ccid_key" ON "convention_collective"("ccid");

-- AddForeignKey
ALTER TABLE "organism_on_ccn" ADD CONSTRAINT "organism_on_ccn_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "convention_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_ccn" ADD CONSTRAINT "organism_on_ccn_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_on_ccn" ADD CONSTRAINT "certification_on_ccn_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "convention_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_on_ccn" ADD CONSTRAINT "certification_on_ccn_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_on_ccn" ADD CONSTRAINT "subscription_request_on_ccn_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "convention_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_on_ccn" ADD CONSTRAINT "subscription_request_on_ccn_subscription_request_id_fkey" FOREIGN KEY ("subscription_request_id") REFERENCES "subscription_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
