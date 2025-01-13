import { buildApp } from "../../infra/server/app";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { prismaClient } from "../../prisma/client";
import { Country, Department } from "@prisma/client";
import * as SendNewEmailCandidateEmailModule from "../candidacy/mails/sendNewEmailCandidateEmail";
import * as SendPreviousEmailCandidateEmailModule from "../candidacy/mails/sendPreviousEmailCandidateEmail";

const mockAdminKeycloakUuid = "1b0e7046-ca61-4259-b716-785f36ab79b2";

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;
});

afterEach(async () => {
  await clearDatabase();
  await jest.clearAllMocks();
});

const getDefaultUpdatedCandidateFields = async () => {
  const pasDeCalais = (await prismaClient.department.findUnique({
    where: { code: "62" },
  })) as Department;

  const france = (await prismaClient.country.findUnique({
    where: { label: "France" },
  })) as Country;

  const updatedCandidateFields = {
    gender: "undisclosed",
    lastname: "newLastName",
    givenName: "newGivenName",
    firstname: "newFirstName",
    firstname2: "newFirstName2",
    firstname3: "newFirstName3",
    birthdate: new Date("1990-01-01").getTime(),
    birthCity: "newBirthCity",
    birthDepartmentId: pasDeCalais.id,
    countryId: france.id,
    nationality: "newNationality",
    street: "newStreet",
    zip: "44000",
    city: "Nantes",
    phone: "+336060606",
    addressComplement: "newAddressComplement",
    email: "newEmail",
  };
  return updatedCandidateFields;
};

describe("candidate information update", () => {
  test("should update all fields of candidate information except the email", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = await getDefaultUpdatedCandidateFields();

    const { birthDepartmentId, countryId, ...expectedResult } = {
      ...updatedCandidateFields,
      birthDepartment: { id: updatedCandidateFields.birthDepartmentId },
      country: { id: updatedCandidateFields.countryId },
      email: candidacy.candidate.email, // email should not be updated, a confirmation is send by email is send instead
    };

    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: mockAdminKeycloakUuid,
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacy.id,
          candidateInformation: {
            id: candidacy.candidateId,
            ...updatedCandidateFields,
          },
        },
        enumFields: ["gender"],
        endpoint: "candidate_updateCandidateInformation",
        returnFields:
          "{ gender, lastname, givenName, firstname, firstname2, firstname3, birthdate, birthCity, birthDepartment {id}, country{id}, nationality, street, zip, city, email, phone, addressComplement}",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateInformation).toMatchObject(
      expectedResult,
    );
  });

  test("should send a confirmation email when trying to update the candidate email", async () => {
    const sendNewEmailCandidateEmailSpy = jest
      .spyOn(SendNewEmailCandidateEmailModule, "sendNewEmailCandidateEmail")
      .mockImplementation(() => Promise.resolve(""));

    const sendPreviousEmailCandidateEmailSpy = jest
      .spyOn(
        SendPreviousEmailCandidateEmailModule,
        "sendPreviousEmailCandidateEmail",
      )
      .mockImplementation(() => Promise.resolve(""));

    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }
    const updatedCandidateFields = await getDefaultUpdatedCandidateFields();

    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: mockAdminKeycloakUuid,
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacy.id,
          candidateInformation: {
            id: candidacy.candidateId,
            ...updatedCandidateFields,
          },
        },
        enumFields: ["gender"],
        endpoint: "candidate_updateCandidateInformation",
        returnFields: "{  email}",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateInformation).toMatchObject({
      email: candidacy.candidate.email,
    });
    expect(sendNewEmailCandidateEmailSpy).toHaveBeenCalled();
    expect(sendPreviousEmailCandidateEmailSpy).toHaveBeenCalled();
  });

  test("should not send a confirmation email when the candidate email has not been changed", async () => {
    const sendNewEmailCandidateEmailSpy = jest
      .spyOn(SendNewEmailCandidateEmailModule, "sendNewEmailCandidateEmail")
      .mockImplementation(() => Promise.resolve(""));

    const sendPreviousEmailCandidateEmailSpy = jest
      .spyOn(
        SendPreviousEmailCandidateEmailModule,
        "sendPreviousEmailCandidateEmail",
      )
      .mockImplementation(() => Promise.resolve(""));

    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = {
      ...(await getDefaultUpdatedCandidateFields()),
      email: candidacy.candidate.email,
    };

    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: mockAdminKeycloakUuid,
      }),
      payload: {
        requestType: "mutation",
        arguments: {
          candidacyId: candidacy.id,
          candidateInformation: {
            id: candidacy.candidateId,
            ...updatedCandidateFields,
          },
        },
        enumFields: ["gender"],
        endpoint: "candidate_updateCandidateInformation",
        returnFields: "{ email }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateInformation).toMatchObject({
      email: candidacy.candidate.email,
    });
    expect(sendNewEmailCandidateEmailSpy).not.toHaveBeenCalled();
    expect(sendPreviousEmailCandidateEmailSpy).not.toHaveBeenCalled();
  });
});
