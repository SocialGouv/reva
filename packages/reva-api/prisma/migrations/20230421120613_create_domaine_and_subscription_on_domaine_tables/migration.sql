-- CreateTable
CREATE TABLE "domaine" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "code" VARCHAR(3) NOT NULL,

    CONSTRAINT "domaine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_request_on_domaine" (
    "domaine_id" UUID NOT NULL,
    "subscription_request_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "subscription_request_on_domaine_pkey" PRIMARY KEY ("domaine_id","subscription_request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domaine_code_key" ON "domaine"("code");

-- AddForeignKey
ALTER TABLE "subscription_request_on_domaine" ADD CONSTRAINT "subscription_request_on_domaine_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "domaine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_on_domaine" ADD CONSTRAINT "subscription_request_on_domaine_subscription_request_id_fkey" FOREIGN KEY ("subscription_request_id") REFERENCES "subscription_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
