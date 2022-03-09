-- CreateTable
CREATE TABLE "rome_certification" (
    "certification_id" UUID NOT NULL,
    "rome_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "rome_certification_pkey" PRIMARY KEY ("certification_id","rome_id")
);

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TRIGGER set_rome_certification_timestamp
BEFORE UPDATE ON rome_certification
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();