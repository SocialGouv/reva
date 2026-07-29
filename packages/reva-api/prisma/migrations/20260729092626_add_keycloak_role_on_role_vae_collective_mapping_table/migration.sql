-- CreateTable
CREATE TABLE "keycloak_role_on_role_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "keycloak_role" TEXT NOT NULL,
    "role" "RoleVaeCollective" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "keycloak_role_on_role_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "keycloak_role_on_role_vae_collective_keycloak_role_role_key" ON "keycloak_role_on_role_vae_collective"("keycloak_role", "role");
