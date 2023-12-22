/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Account,
  CertificationAuthority,
  CertificationAuthorityLocalAccount,
} from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

const CERTIFICATION_AUTHORITY_KEYCLOAK_ID =
  "3c6d4571-da18-49a3-90e5-cc83ae7446bf";

const CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT_1_KEYCLOAK_ID =
  "dc2b8b90-f8f8-4f89-93da-c236083762ba";

let certificationAccountAutorityAccount = {} as Account;
let certificationAuthority = {} as CertificationAuthority;
let certificationAccountAutorityLocalAccount1Account = {} as Account;

let certificationAuthorityLocalAccount1 =
  {} as CertificationAuthorityLocalAccount;

beforeAll(async () => {
  certificationAccountAutorityAccount = await prismaClient.account.create({
    data: {
      email: "certificationauth@gmail.com",
      keycloakId: CERTIFICATION_AUTHORITY_KEYCLOAK_ID,
    },
  });
  certificationAuthority = await prismaClient.certificationAuthority.create({
    data: {
      Account: { connect: { id: certificationAccountAutorityAccount.id } },
      label: "certification authority",
    },
  });

  certificationAccountAutorityLocalAccount1Account =
    await prismaClient.account.create({
      data: {
        email: "certificationauthoritylocalaccount1@gmail.com",
        keycloakId: CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT_1_KEYCLOAK_ID,
      },
    });

  certificationAuthorityLocalAccount1 =
    await prismaClient.certificationAuthorityLocalAccount.create({
      data: {
        certificationAuthorityId: certificationAuthority.id,
        accountId: certificationAccountAutorityLocalAccount1Account.id,
      },
    });
});

afterAll(async () => {
  await prismaClient.account.delete({
    where: {
      id: certificationAccountAutorityAccount.id,
    },
  });
  await prismaClient.certificationAuthorityLocalAccount.delete({
    where: { id: certificationAuthorityLocalAccount1.id },
  });
  await prismaClient.certificationAuthority.delete({
    where: { id: certificationAuthority.id },
  });
  await prismaClient.account.delete({
    where: {
      id: certificationAccountAutorityLocalAccount1Account.id,
    },
  });
});

test("should return an exisiting certification local account list of 1 item for the certification authority", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId: CERTIFICATION_AUTHORITY_KEYCLOAK_ID,
    }),
    payload: {
      requestType: "query",
      endpoint: "account_getAccountForConnectedUser",
      returnFields:
        "{certificationAuthority{certificationAuthorityLocalAccounts{id}}}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(
    obj.data.account_getAccountForConnectedUser.certificationAuthority
      .certificationAuthorityLocalAccounts
  ).toMatchObject([{ id: certificationAuthorityLocalAccount1.id }]);
});
