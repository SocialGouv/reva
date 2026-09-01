-- CreateTable
CREATE TABLE
    "permission_specific_to_sous_compte_vae_collective" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
        "permission" "PermissionVaeCollective" NOT NULL,
        "sous_compte_vae_collective_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6),
        CONSTRAINT "permission_specific_to_sous_compte_vae_collective_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "permission_specific_to_sous_compte_vae_collective_permissio_key" ON "permission_specific_to_sous_compte_vae_collective" ("permission", "sous_compte_vae_collective_id");