-- CreateTable
CREATE TABLE "FileUploadSpooler" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destination_file_name" VARCHAR(255) NOT NULL,
    "destination_path" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "file_content" BYTEA NOT NULL,

    CONSTRAINT "FileUploadSpooler_pkey" PRIMARY KEY ("id")
);
