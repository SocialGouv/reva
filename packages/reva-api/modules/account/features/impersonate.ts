import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import {
  impersonateAccount,
  impersonateCandiate,
} from "../utils/keycloak.utils";
import { TokenService } from "../utils/token.service";

export const getImpersonateUrl = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakId: string;
  },
  params: {
    accountId?: string;
    candidateId?: string;
  },
): Promise<string | undefined> => {
  const { accountId, candidateId } = params;

  const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

  if (accountId) {
    const token = await getImpersonateTokenForAccount(context, { accountId });
    return `${baseUrl}/api/account/impersonate?token=${token}`;
  } else if (candidateId) {
    const token = await getImpersonateTokenForCandidate(context, {
      candidateId,
    });
    return `${baseUrl}/api/account/impersonate?token=${token}`;
  }

  return undefined;
};

const getImpersonateTokenForAccount = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakId: string;
  },
  params: {
    accountId: string;
  },
): Promise<string> => {
  const { hasRole } = context;

  if (!hasRole("admin") && !hasRole("gestion_maison_mere_aap")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { accountId } = params;

  // Check if accountToUpdate with accountId exsits
  const accountToUpdate = await prismaClient.account.findUnique({
    where: { id: accountId },
  });

  if (!accountToUpdate) {
    throw new Error(`Compte utilisateur pour l'id ${accountId} non trouvé`);
  }

  const keycloakAdmin = await getKeycloakAdmin();

  // Check if account with accountToUpdate.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: accountToUpdate.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${accountToUpdate.keycloakId} non trouvé`,
    );
  }

  // Check if keycloakId of logged user is different from accountToUpdate.keycloakId
  // If false, check if accountToUpdate is not an admin
  if (context.keycloakId != accountToUpdate.keycloakId) {
    // Get groups of accountToUpdate
    const groups = await keycloakAdmin.users.listGroups({
      id: accountToUpdate.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    });

    // Check if account with accountToUpdate.keycloakId is not an admin account
    const groupAdmin = groups.find((group) => group.name == "admin");
    if (groupAdmin) {
      throw new Error(
        `Les informations d'un compte utilisateur keycloak de type "admin" ne peuvent être consultées`,
      );
    }
  }

  const token = TokenService.getInstance().getToken({
    accountId: accountToUpdate.keycloakId,
  });
  return token;
};

const getImpersonateTokenForCandidate = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakId: string;
  },
  params: {
    candidateId: string;
  },
): Promise<string> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { candidateId } = params;

  // Check if candidateToUpdate with candidateId exsits
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidateToUpdate) {
    throw new Error(`Compte utilisateur pour l'id ${candidateId} non trouvé`);
  }

  const keycloakAdmin = await getKeycloakAdmin();

  // Check if candidate with candidateToUpdate.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: candidateToUpdate.keycloakId,
    realm: process.env.KEYCLOAK_APP_REALM,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${candidateToUpdate.keycloakId} non trouvé`,
    );
  }

  const token = TokenService.getInstance().getToken({
    candidateId: candidateToUpdate.keycloakId,
  });

  return token;
};

export const impersonate = async (
  token: string,
): Promise<
  | {
      headers: [string, string][];
      redirect: string;
    }
  | undefined
> => {
  const payload = TokenService.getInstance().getPayload(token);
  if (!payload) {
    throw new Error("Unauthorized");
  }

  const { accountId, candidateId } = payload;

  if (accountId) {
    return impersonateAccount(payload.accountId);
  } else if (candidateId) {
    return impersonateCandiate(payload.candidateId);
  }
};
