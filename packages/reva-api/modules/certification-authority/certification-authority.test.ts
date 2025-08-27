import { Account } from "@prisma/client";

import { graphql } from "@/modules/graphql/generated";
import { UpdateCertificationAuthorityInput } from "@/modules/graphql/generated/graphql";
import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";
import { getGraphQLClient, getGraphQLError } from "@/test/test-graphql-client";

import * as createAccount from "../account/features/createAccount";

import { getCertificationAuthorityLocalAccountByCertificationAuthorityId } from "./features/getCertificationAuthorityLocalAccountByCertificationAuthorityId";

async function graphqlUpdateCertificationAuthority({
  role,
  account,
  certificationAuthorityId,
  data,
}: {
  role: KeyCloakUserRole;
  account: { keycloakId: string };
  certificationAuthorityId: string;
  data: UpdateCertificationAuthorityInput;
}) {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role,
        keycloakId: account.keycloakId,
      }),
    },
  });

  const updateCertificationAuthorityById = graphql(`
    mutation updateCertificationAuthority(
      $certificationAuthorityId: ID!
      $certificationAuthorityData: UpdateCertificationAuthorityInput!
    ) {
      certification_authority_updateCertificationAuthority(
        certificationAuthorityId: $certificationAuthorityId
        certificationAuthorityData: $certificationAuthorityData
      ) {
        id
        label
        contactFullName
        contactEmail
        account {
          email
          firstname
          lastname
        }
      }
    }
  `);

  return graphqlClient.request(updateCertificationAuthorityById, {
    certificationAuthorityId,
    certificationAuthorityData: data,
  });
}

test("should update a certification authority's contact info and leave the account info as is as a certificaton authority manager", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  const resp = await graphqlUpdateCertificationAuthority({
    role: "manage_certification_authority_local_account",
    account: certificationAuthority.Account[0],
    certificationAuthorityId: certificationAuthority.id,
    data: {
      accountEmail: "new email",
      accountFirstname: "new firstname",
      accountLastname: "new lastname",
      contactFullName: "new name",
      contactEmail: "new email",
    },
  });

  expect(resp.certification_authority_updateCertificationAuthority).toEqual({
    id: certificationAuthority.id,
    label: certificationAuthority.label,
    contactFullName: "new name",
    contactEmail: "new email",
    account: {
      email: certificationAuthority.Account[0].email,
      firstname: certificationAuthority.Account[0].firstname,
      lastname: certificationAuthority.Account[0].lastname,
    },
  });
});

test("should update a certification authority's contact and account info as an admin", async () => {
  vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(() =>
    Promise.resolve({
      users: {
        findOne: () => Promise.resolve({}),
        listGroups: () => Promise.resolve([]),
        update: () => Promise.resolve({}),
      },
    }),
  );

  const certificationAuthority = await createCertificationAuthorityHelper();

  const resp = await graphqlUpdateCertificationAuthority({
    role: "admin",
    account: {
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    },
    certificationAuthorityId: certificationAuthority.id,
    data: {
      accountEmail: "new account email",
      accountFirstname: "new account firstname",
      accountLastname: "new account lastname",
      contactFullName: "new name",
      contactEmail: "new email",
    },
  });

  expect(resp.certification_authority_updateCertificationAuthority).toEqual({
    id: certificationAuthority.id,
    label: certificationAuthority.label,
    contactFullName: "new name",
    contactEmail: "new email",
    account: {
      email: "new account email",
      firstname: "new account firstname",
      lastname: "new account lastname",
    },
  });
});

test("should refuse to to update a certification authority's contact info as a candidacy manager", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  try {
    await graphqlUpdateCertificationAuthority({
      role: "manage_candidacy",
      account: {
        keycloakId: "64ae851c-9519-4efb-a483-db4b71918e2d",
      },
      certificationAuthorityId: certificationAuthority.id,
      data: {
        accountEmail: "new email",
        accountFirstname: "new firstname",
        accountLastname: "new lastname",
        contactFullName: "new name",
        contactEmail: "new email",
      },
    });
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toEqual("You are not authorized!");
  }
});

test("should refuse to to update a certification authority's contact info as a candidate", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  try {
    await graphqlUpdateCertificationAuthority({
      role: "candidate",
      account: {
        keycloakId: "64ae851c-9519-4efb-a483-db4b71918e2d",
      },
      certificationAuthorityId: certificationAuthority.id,
      data: {
        accountEmail: "new account email",
        accountFirstname: "new account firstname",
        accountLastname: "new account lastname",
        contactFullName: "new name",
        contactEmail: "new email",
      },
    });
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toEqual("You are not authorized!");
  }
});

test("should update all of a certification authority's local accounts contact info when isGlobalContact is true", async () => {
  vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(() =>
    Promise.resolve({
      users: {
        findOne: () => Promise.resolve({}),
        listGroups: () => Promise.resolve([]),
        update: () => Promise.resolve({}),
      },
    }),
  );

  const certificationAuthority = await createCertificationAuthorityHelper();

  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
  });

  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
  });

  const resp = await graphqlUpdateCertificationAuthority({
    role: "admin",
    account: {
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    },
    certificationAuthorityId: certificationAuthority.id,
    data: {
      accountEmail: "new account email",
      accountFirstname: "new account firstname",
      accountLastname: "new account lastname",
      contactFullName: "new name",
      contactEmail: "new email",
      isGlobalContact: true,
    },
  });

  expect(resp.certification_authority_updateCertificationAuthority).toEqual({
    id: certificationAuthority.id,
    label: certificationAuthority.label,
    contactFullName: "new name",
    contactEmail: "new email",
    account: {
      email: "new account email",
      firstname: "new account firstname",
      lastname: "new account lastname",
    },
  });

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
    });

  expect(localAccounts?.length).toEqual(2);

  for (const localAccount of localAccounts!) {
    expect(localAccount.contactFullName).toEqual("new name");
    expect(localAccount.contactEmail).toEqual("new email");
  }
});

test("should return an exisiting certification local account list of 1 item for the certification authority", async () => {
  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper();

  const resp = await injectGraphql({
    fastify: global.testApp,
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
  vi.spyOn(createAccount, "createAccount").mockImplementation(() =>
    Promise.resolve({} as Account),
  );

  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper();

  const resp = await injectGraphql({
    fastify: global.testApp,
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
