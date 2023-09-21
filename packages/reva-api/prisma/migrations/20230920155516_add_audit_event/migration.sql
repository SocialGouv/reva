-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("keycloak_id") ON DELETE RESTRICT ON UPDATE CASCADE;
