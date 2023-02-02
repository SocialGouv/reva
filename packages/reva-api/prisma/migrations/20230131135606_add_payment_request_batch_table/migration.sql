-- CreateTable
CREATE TABLE "payment_request_batch" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "payment_request_id" UUID NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,

    CONSTRAINT "payment_request_batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_request_batch_payment_request_id_key" ON "payment_request_batch"("payment_request_id");

-- AddForeignKey
ALTER TABLE "payment_request_batch" ADD CONSTRAINT "payment_request_batch_payment_request_id_fkey" FOREIGN KEY ("payment_request_id") REFERENCES "payment_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
