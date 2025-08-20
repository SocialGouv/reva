import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import { getKeycloakAdmin } from "../../shared/auth/getKeycloakAdmin";

export const getAccount = async (params: {
  email: string;
  username: string;
}): Promise<UserRepresentation | null> => {
  const keycloakAdmin = await getKeycloakAdmin();

  const [userByEmail] = await keycloakAdmin.users.find({
    email: params.email,
    exact: true,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  if (userByEmail) {
    return userByEmail;
  }

  const [userByUsername] = await keycloakAdmin.users.find({
    username: params.username,
    exact: true,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  return userByUsername;
};

type UserProfileType =
  | "admin"
  | "gestionnaire_maison_mere_aap"
  | "organism"
  | "certification_authority"
  | "certification_registry_manager"
  | "commanditaire_vae_collective";

export const createAccount = async (params: {
  email: string;
  username: string;
  firstname?: string;
  lastname?: string;
  maisonMereAAPRaisonSociale?: string;
  group:
    | "admin"
    | "organism"
    | "certification_authority"
    | "gestionnaire_maison_mere_aap"
    | "certification_authority_local_account"
    | "certification_registry_manager"
    | "commanditaire_vae_collective";
  dontSendKeycloakEmail?: boolean;
}): Promise<string> => {
  const { dontSendKeycloakEmail, ...account } = params;

  const sendKeycloakEmail = !dontSendKeycloakEmail;

  const keycloakAdmin = await getKeycloakAdmin();

  const payload: UserRepresentation & { realm?: string | undefined } = {
    email: account.email,
    username: account.username,
    groups: [account.group],
    firstName: account.firstname,
    lastName: account.lastname,
    //When setting the password for the first time if we are not sending an email via keycloak we need to remove the "VERIFY_EMAIL" action
    //Otherwise the user will not be able to login
    requiredActions: dontSendKeycloakEmail
      ? ["UPDATE_PASSWORD"]
      : ["UPDATE_PASSWORD", "VERIFY_EMAIL"],
    enabled: true,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  };

  let userProfileType: UserProfileType = {} as UserProfileType;

  switch (account.group) {
    case "certification_authority_local_account":
      userProfileType = "certification_authority";
      break;
    default:
      userProfileType = account.group;
      break;
  }

  payload.attributes = {
    user_profile_type: userProfileType,
    nom_maison_mere_aap: account.maisonMereAAPRaisonSociale,
  };

  let id;
  try {
    const resp = await keycloakAdmin.users.create(payload);
    id = resp.id;
  } catch (error) {
    console.error("Error creating user", error);
    throw error;
  }

  try {
    if (sendKeycloakEmail) {
      await keycloakAdmin.users.executeActionsEmail({
        id,
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA,
        actions: ["UPDATE_PASSWORD"],
        lifespan: 4 * 24 * 60 * 60, // 4 days
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      });
    }
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }

  return id;
};
