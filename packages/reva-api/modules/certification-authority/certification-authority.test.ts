import {
  Account,
  CertificationAuthority,
  CertificationAuthorityLocalAccount,
} from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { CERTIFICATION_AUTHORITY_STRUCTURES } from "../../test/fixtures";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { buildApp } from "../../infra/server/app";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";

import * as createAccount from "../account/features/createAccount";

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
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;

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
      certificationAuthorityStructureId:
        CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
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
      .certificationAuthorityLocalAccounts,
  ).toMatchObject([{ id: certificationAuthorityLocalAccount1.id }]);
});

test("should create a certification authority", async () => {
  jest
    .spyOn(createAccount, "createAccount")
    .mockImplementation(() => Promise.resolve({} as Account));

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "certification_authority_createCertificationAuthority",
      arguments: {
        input: {
          label: "Mon autorite de certification",
          certificationAuthorityStructureId:
            CERTIFICATION_AUTHORITY_STRUCTURES.UIMM.id,
          contactEmail: "testcontact.test@gmail.com",
          contactFullName: "Monieur test test",
          accountEmail: "testaccount.test@gmail.com",
          accountFirstname: "testFirstname",
          accountLastname: "testLastname",
          certificationIds: [],
        },
      },
      returnFields: "{id}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(resp.json()).not.toHaveProperty("errors");
  expect(
    obj.data.certification_authority_createCertificationAuthority.id,
  ).not.toBeNull();
});
