import { Gender } from "@prisma/client";

const GENDER_MAN = "man" as Gender;
const GENDER_WOMAN = "woman" as Gender;
const DATE_NOW = new Date();

export const CANDIDATE_MAN = {
  id: "00000000-0000-0000-0000-000000000001",
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@test.com",
  gender: GENDER_MAN,
  keycloakId: "00000000-0000-0000-0000-000000000002",
  firstname2: "Paul",
  firstname3: "Robert",
  phone: "0123456789",
  highestDegreeId: null,
  vulnerabilityIndicatorId: null,
  createdAt: DATE_NOW,
  updatedAt: null,
};

export const CANDIDATE_WOMAN = {
  firstname: "Jane",
  lastname: "Doe",
  email: "jane.doe@test.com",
  gender: GENDER_WOMAN,
  keycloakId: "00000000-0000-0000-0000-000000000003",
  firstname2: "Betty",
  firstname3: "Catherine",
  phone: "0123456789",
  highestDegreeId: null,
  vulnerabilityIndicatorId: null,
  createdAt: DATE_NOW,
  updatedAt: null,
};
