import { Account } from "@prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCertificationAuthorityLocalAccountHelper } from "../../test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationAuthorityStructureHelper } from "../../test/helpers/entities/create-certification-authority-structure-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import * as createAccount from "../account/features/createAccount";

test("should return an exisiting certification local account list of 1 item for the certification authority", async () => {
  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper();

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_certification_authority_local_account",
      keycloakId:
        certificationAuthorityLocalAccount.certificationAuthority.Account[0]
          .keycloakId,
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
  ).toMatchObject([{ id: certificationAuthorityLocalAccount.id }]);
});

test("should create a certification authority", async () => {
  jest
    .spyOn(createAccount, "createAccount")
    .mockImplementation(() => Promise.resolve({} as Account));

  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper();

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
          certificationAuthorityStructureId: certificationAuthorityStructure.id,
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
