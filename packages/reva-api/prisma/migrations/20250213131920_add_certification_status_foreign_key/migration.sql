-- AddForeignKey
ALTER TABLE "certification_status_history" ADD CONSTRAINT "certification_status_history_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
