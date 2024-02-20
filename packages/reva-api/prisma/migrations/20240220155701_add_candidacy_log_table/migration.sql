-- CreateTable
CREATE TABLE "candidacy_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_keycloak_id" UUID NOT NULL,
    "candidacy_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidacy_log" ADD CONSTRAINT "candidacy_log_user_keycloak_id_fkey" FOREIGN KEY ("user_keycloak_id") REFERENCES "account"("keycloak_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_log" ADD CONSTRAINT "candidacy_log_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
