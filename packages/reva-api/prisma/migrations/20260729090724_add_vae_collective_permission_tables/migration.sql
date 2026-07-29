-- CreateEnum
CREATE TYPE "PermissionVaeCollective" AS ENUM ('CREER_COHORTE');

-- CreateEnum
CREATE TYPE "RoleVaeCollective" AS ENUM ('ADMINISTRATEUR_PORTEUR_DE_PROJET');

-- CreateTable
CREATE TABLE "role_permission_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role" "RoleVaeCollective" NOT NULL,
    "permission" "PermissionVaeCollective" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "role_permission_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission_specific_to_cohorte_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role" "RoleVaeCollective" NOT NULL,
    "permission" "PermissionVaeCollective" NOT NULL,
    "cohorteVaeCollectiveId" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "role_permission_specific_to_cohorte_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_vae_collective_role_permission_key" ON "role_permission_vae_collective"("role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_specific_to_cohorte_vae_collective_role_per_key" ON "role_permission_specific_to_cohorte_vae_collective"("role", "permission");

-- AddForeignKey
ALTER TABLE "role_permission_specific_to_cohorte_vae_collective" ADD CONSTRAINT "role_permission_specific_to_cohorte_vae_collective_cohorte_fkey" FOREIGN KEY ("cohorteVaeCollectiveId") REFERENCES "cohorte_vae_collective"("id") ON DELETE SET NULL ON UPDATE CASCADE;
