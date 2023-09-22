/**
 * Create `account` records + keyCloak accounts associated
 * to certification authorities read from Airtable CSV file
 *
 * npm run create_auth_accounts
 *
 * Achtung: check out CSV first !
 */
import path from "path";

import KcAdminClient from "@keycloak/keycloak-admin-client";
import dotenv from "dotenv";

import { createAccountProfile } from "../../../modules/account/database/accounts";
import { createAccount } from "../../../modules/account/features/createAccount";
import * as IAM from "../../../modules/account/features/keycloak";
import { getCertificationAuthorityById } from "../../../modules/feasibility/feasibility.features";
import * as organismsDb from "../../../modules/organism/database/organisms";
import { logger } from "../../../modules/shared/logger";
import { prismaClient } from "../../client";
import { readCsvRows } from "../read-csv";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

// CSV FILE USED FOR ACCOUNTS CREATION
const filePath = "./referentials/certification-authorities.csv";

const keycloakAdmin = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_ADMIN_URL,
  realmName: process.env.KEYCLOAK_ADMIN_REALM,
});

function cleanEmail(email: string): string {
  return email.toLowerCase().replace(/\s/g, "");
}

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
    email: cleanEmail(params.contactEmail),
    certificationAuthorityId: params.id,
    username: cleanEmail(params.contactEmail),
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

  const emailsOfAccountsToCreate = authorities
    .filter((a) => !!a)
    .map((a) => a.contactEmail);

  const existingEmails = (
    await prismaClient.account.findMany({
      select: { email: true },
      where: { email: { in: emailsOfAccountsToCreate } },
    })
  ).map((eemail) => eemail.email);

  const authoritiesToCreateAccountFor = authorities.filter(
    (a) => !existingEmails.includes(a.contactEmail as string)
  );

  logger.info(
    { existingEmails },
    `Accounts for the following emails already exists in the account table and will NOT be created`
  );

  logger.info(
    { authoritiesToCreateAccountFor },
    `Accounts for the following authorities will be created`
  );

      logger.info(`creating account for ${authority.contactEmail}`);
  }
}

(async () => {
  await createCertificationAuthoritiesAccounts();
})();
