import { Country, Department } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import * as SendNewEmailCandidateEmailModule from "../candidacy/emails/sendNewEmailCandidateEmail";
import * as SendPreviousEmailCandidateEmailModule from "../candidacy/emails/sendPreviousEmailCandidateEmail";

const mockAdminKeycloakUuid = "1b0e7046-ca61-4259-b716-785f36ab79b2";

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
    birthdate: "1990-01-01",
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
  test("should update all fields of candidate information", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = await getDefaultUpdatedCandidateFields();

    const { birthDepartmentId, countryId, ...expectedResult } = {
      ...updatedCandidateFields,
      birthDepartment: { id: updatedCandidateFields.birthDepartmentId },
      country: { id: updatedCandidateFields.countryId },
    };

    const resp = await injectGraphql({
      fastify: global.testApp,
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

  test("should send notification emails when updating the candidate email", async () => {
    const sendNewEmailCandidateEmailSpy = vi
      .spyOn(SendNewEmailCandidateEmailModule, "sendNewEmailCandidateEmail")
      .mockImplementation(() => Promise.resolve());

    const sendPreviousEmailCandidateEmailSpy = vi
      .spyOn(
        SendPreviousEmailCandidateEmailModule,
        "sendPreviousEmailCandidateEmail",
      )
      .mockImplementation(() => Promise.resolve());

    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }
    const updatedCandidateFields = await getDefaultUpdatedCandidateFields();

    const resp = await injectGraphql({
      fastify: global.testApp,
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
      email: updatedCandidateFields.email,
    });
    expect(sendNewEmailCandidateEmailSpy).toHaveBeenCalled();
    expect(sendPreviousEmailCandidateEmailSpy).toHaveBeenCalled();
  });

  test("should not send notification emails when the candidate email has not been changed", async () => {
    const sendNewEmailCandidateEmailSpy = vi
      .spyOn(SendNewEmailCandidateEmailModule, "sendNewEmailCandidateEmail")
      .mockImplementation(() => Promise.resolve());

    const sendPreviousEmailCandidateEmailSpy = vi
      .spyOn(
        SendPreviousEmailCandidateEmailModule,
        "sendPreviousEmailCandidateEmail",
      )
      .mockImplementation(() => Promise.resolve());

    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = {
      ...(await getDefaultUpdatedCandidateFields()),
      email: candidacy.candidate.email,
    };

    const resp = await injectGraphql({
      fastify: global.testApp,
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

  test("should update the candidate department when the zip code is updated", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = await getDefaultUpdatedCandidateFields();

    const resp = await injectGraphql({
      fastify: global.testApp,
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
        returnFields: "{ department { label } }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateInformation).toMatchObject({
      department: { label: "Loire-Atlantique" },
    });
  });

  test("should be able to update a candidate zipcode with an overseas terrtory zip code", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const updatedCandidateFields = {
      ...(await getDefaultUpdatedCandidateFields()),
      zip: "97100",
    };

    const resp = await injectGraphql({
      fastify: global.testApp,
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
        returnFields: "{ department { label } }",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).not.toHaveProperty("errors");
    const obj = resp.json();
    expect(obj.data.candidate_updateCandidateInformation).toMatchObject({
      department: { label: "Guadeloupe" },
    });
  });
});
