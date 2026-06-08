-- CreateTable
CREATE TABLE
    "account_email_otp" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "account_id" UUID NOT NULL,
        "otp" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "account_email_otp_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "account_email_otp_account_id_key" ON "account_email_otp" ("account_id");

-- AddForeignKey
ALTER TABLE "account_email_otp" ADD CONSTRAINT "account_email_otp_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;