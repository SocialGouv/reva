/**
 * Create `account` records + keyCloak accounts associated
 * to certification authorities read from Airtable CSV file
 *
 * npm run create_auth_accounts
 *
 * Achtung: check out CSV first !
 */

// CSV FILE USED FOR ACCOUNTS CREATION
const filePath = "./referentials/certification-authorities.csv";

import KcAdminClient from "@keycloak/keycloak-admin-client";

import * as IAM from "../../../infra/iam/keycloak";
import { createAccountProfile } from "../../../modules/account/database/accounts";
import { createAccount } from "../../../modules/account/features/createAccount";
import { getCertificationAuthorityById } from "../../../modules/feasibility/feasibility.features";
import * as organismsDb from "../../../modules/organism/database/organisms";
import { readCsvRows } from "../read-csv";

const keycloakAdmin = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_ADMIN_URL,
  realmName: process.env.KEYCLOAK_ADMIN_REALM,
});

const createAccountForCertificationAuthority = (params: {
  contactEmail: string;
  id: string;
}) =>
  createAccount({
    createAccountInIAM: IAM.createAccount(keycloakAdmin),
    createAccountWithProfile: createAccountProfile,
    getAccountInIAM: IAM.getAccount(keycloakAdmin),
    getOrganismById: organismsDb.getOrganismById,
    getCertificationAuthorityById,
  })({
    group: "certification_authority",
    email: params.contactEmail,
    certificationAuthorityId: params.id,
    username: params.contactEmail,
  });

async function createCertificationAuthoritiesAccounts() {
  await keycloakAdmin.auth({
    grantType: "client_credentials",
    clientId: process.env.KEYCLOAK_ADMIN_CLIENTID || "admin-cli",
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
  });

  const authorities = await readCsvRows({
    filePath,
    headersDefinition: [
      undefined,
      "id",
      undefined,
      "contactEmail",
      undefined,
      undefined,
    ],
  });

  for (const authority of authorities) {
    console.log("creating account for", authority.contactEmail);
    (await createAccountForCertificationAuthority(authority)).mapLeft(
      console.error
    );
  }
}

(async () => {
  await createCertificationAuthoritiesAccounts();
})();
