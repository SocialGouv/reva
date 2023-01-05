import { Account } from "@prisma/client";
import { Maybe } from "purify-ts";
import { Either, Right } from "purify-ts/Either";

import { Candidacy, Organism } from "../types/candidacy";
import { canManageCandidacy } from "./canManageCandidacy";

const candidacyId1 = "05848ab2-d10d-44b2-9657-92e7fadfdbdd";
const keycloakId1 = "9740656d-0b07-4801-aa85-e624163b2b66";
const keycloakId2 = "";
const organismId1 = "";
const apAccountId1 = "";
const apAccountId2 = "";

const apAccount1: Account = {
  id: apAccountId1,
  keycloakId: keycloakId1,
  organismId: organismId1,
  firstname: "Doobedee",
  lastname: "Lalala",
  email: "john.doe@gmail.com",
};

const apAccount2: Account = {
  id: apAccountId2,
  keycloakId: keycloakId2,
  organismId: organismId1,
  firstname: "Feeew",
  lastname: "Mojo",
  email: "name@mail.com",
};

const blankCandidacy: Candidacy = {
  id: "",
  candidacyStatuses: [],
  createdAt: new Date(),
  department: null,
  deviceId: "",
  email: null,
  experiences: [],
  goals: [],
  phone: null,
};

const blankOrganism: Organism = {
  id: "",
  label: "",
  address: "",
  zip: "",
  city: "",
  siret: "",
  contactAdministrativeEmail: "",
};
const getCandidacyFromIdMock = (
  candidacyId: string
): Promise<Either<string, Candidacy>> =>
  Promise.resolve(
    Maybe.fromNullable({
      ...blankCandidacy,
      id: candidacyId,
      organism: {
        ...blankOrganism,
        id: organismId1,
      },
    }).toEither("nope")
  );

const getAccountFromKeycloakIdMock = (keycloakId: string) =>
  Promise.resolve(Right(keycloakId === keycloakId1 ? apAccount1 : apAccount2));

describe("candidacy management protection", () => {
  test("should fail when account is not candidacy manager", () => undefined);
  test("should fail when account's organism is different", () => undefined);
  test("should succeed", async () => {
    const response = await canManageCandidacy(
      {
        hasRole: (_) => true,
        getAccountFromKeycloakId: getAccountFromKeycloakIdMock,
        getCandidacyFromId: getCandidacyFromIdMock,
      },
      { candidacyId: candidacyId1, keycloakId: keycloakId1 }
    );
    const allowed = response.extract();
    expect(typeof allowed).not.toBe("string");
    expect(allowed).toEqual(true);
  });
});
