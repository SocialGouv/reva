/*
  Warnings:

  - You are about to drop the `FileUploadSpooler` table. If the table is not empty, all the data it contains will be lost.

*/
-- Rename
ALTER TABLE "FileUploadSpooler"
  RENAME TO "file_upload_spooler";

ALTER TABLE "SubscriptionRequest"
  RENAME TO "subscription_request";