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

import { createAccount } from "../../../modules/account/features/createAccount";
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
    keycloakAdmin,
    group: "certification_authority",
    email: cleanEmail(params.contactEmail),
    certificationAuthorityId: params.id,
    username: cleanEmail(params.contactEmail),
  });

async function createCertificationAuthoritiesAccounts({
  dryRun,
}: {
  dryRun: boolean;
}) {
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

  const authoritiesToCreateAccountFor = authorities
    .filter((a) => !!a.contactEmail)
    .filter((a) => !existingEmails.includes(a.contactEmail as string));

  logger.info(
    { existingEmails },
    `Accounts for the following emails already exists in the account table and will NOT be created`
  );

  logger.info(
    {
      emailsToCreateAccountfor: authoritiesToCreateAccountFor.map(
        (a) => a.contactEmail
      ),
    },
    `Accounts for the following emails already exists in the account table and WILL be created`
  );

  logger.info(
    { authoritiesToCreateAccountFor },
    `Accounts for the following authorities will be created`
  );

  if (!dryRun) {
    for (const authority of authoritiesToCreateAccountFor) {
      logger.info(`creating account for ${authority.contactEmail}`);
      try {
        await createAccountForCertificationAuthority(authority);
      } catch (e) {
        logger.error(e);
      }
    }
  }
}

(async () => {
  const dryRun = process.argv[2] === "--dry-run";

  logger.info(
    "Running in " +
      (dryRun
        ? "DRY RUN MODE: Accounts will NOT be created"
        : "PRODUCTON MODE: Accounts WILL be created")
  );
  await createCertificationAuthoritiesAccounts({ dryRun });
})();
