-- CreateTable
CREATE TABLE "funding_request_batch" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "funding_request_id" UUID NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "batch_file_name" TEXT,
    "content" JSONB NOT NULL,

    CONSTRAINT "funding_request_batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funding_request_batch_funding_request_id_key" ON "funding_request_batch"("funding_request_id");

-- AddForeignKey
ALTER TABLE "funding_request_batch" ADD CONSTRAINT "funding_request_batch_funding_request_id_fkey" FOREIGN KEY ("funding_request_id") REFERENCES "funding_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
