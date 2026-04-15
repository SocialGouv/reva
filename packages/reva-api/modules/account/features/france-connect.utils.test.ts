import {
  checkPivotFieldsMatch,
  parseFranceConnectDate,
  splitGivenName,
} from "./france-connect.utils";

describe("checkPivotFieldsMatch", () => {
  const baseCandidate = {
    candidateFirstname: "Jean",
    candidateLastname: "Dupont",
    candidateBirthdate: "1990-05-15",
  };

  const baseFc = {
    fcGivenName: "Jean Pierre",
    fcFamilyName: "Dupont",
    fcBirthdate: "1990-05-15",
  };

  test("returns isMatch true when all pivot fields match", () => {
    const result = checkPivotFieldsMatch({ ...baseCandidate, ...baseFc });
    expect(result.isMatch).toBe(true);
    expect(result.mismatchedFields).toEqual([]);
  });

  test("returns isMatch true with accent differences in names", () => {
    const result = checkPivotFieldsMatch({
      ...baseFc,
      candidateFirstname: "René",
      candidateLastname: "Müller",
      candidateBirthdate: "1990-05-15",
      fcGivenName: "Rene",
      fcFamilyName: "Muller",
    });
    expect(result.isMatch).toBe(true);
    expect(result.mismatchedFields).toEqual([]);
  });

  test("returns isMatch true with case differences", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      candidateFirstname: "JEAN",
      candidateLastname: "DUPONT",
    });
    expect(result.isMatch).toBe(true);
    expect(result.mismatchedFields).toEqual([]);
  });

  test("returns isMatch false with firstname in mismatchedFields", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      candidateFirstname: "Marie",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["firstname"]);
  });

  test("returns isMatch false with lastname in mismatchedFields", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      candidateLastname: "Martin",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["lastname"]);
  });

  test("returns isMatch false with birthdate in mismatchedFields", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      candidateBirthdate: "1985-01-01",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["birthdate"]);
  });

  test("returns isMatch false when candidate birthdate is null", () => {
    const result = checkPivotFieldsMatch({
      ...baseFc,
      candidateFirstname: "Jean",
      candidateLastname: "Dupont",
      candidateBirthdate: null,
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["birthdate"]);
  });

  test("returns isMatch false when FC birthdate has a non-ISO format", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      fcBirthdate: "15/05/1990",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["birthdate"]);
  });

  test("returns isMatch false when FC birthdate is an invalid string", () => {
    const result = checkPivotFieldsMatch({
      ...baseCandidate,
      ...baseFc,
      fcBirthdate: "invalid-date",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual(["birthdate"]);
  });

  test("returns multiple mismatchedFields when several fields differ", () => {
    const result = checkPivotFieldsMatch({
      ...baseFc,
      candidateFirstname: "Marie",
      candidateLastname: "Martin",
      candidateBirthdate: "1985-01-01",
    });
    expect(result.isMatch).toBe(false);
    expect(result.mismatchedFields).toEqual([
      "firstname",
      "lastname",
      "birthdate",
    ]);
  });
});

describe("splitGivenName", () => {
  test("retourne firstname seul quand la chaîne contient un seul prénom", () => {
    expect(splitGivenName("Jean")).toEqual({
      firstname: "Jean",
      firstname2: undefined,
      firstname3: undefined,
    });
  });

  test("répartit deux prénoms sur firstname et firstname2", () => {
    expect(splitGivenName("Jean Pierre")).toEqual({
      firstname: "Jean",
      firstname2: "Pierre",
      firstname3: undefined,
    });
  });

  test("regroupe les prénoms supplémentaires dans firstname3", () => {
    const result = splitGivenName("Jean Pierre Marie Paul");
    expect(result.firstname).toBe("Jean");
    expect(result.firstname2).toBe("Pierre");
    expect(result.firstname3).toBe("Marie Paul");
  });

  test("retourne firstname vide quand la chaîne est vide ou ne contient que des espaces", () => {
    expect(splitGivenName("")).toEqual({
      firstname: "",
      firstname2: undefined,
      firstname3: undefined,
    });
    expect(splitGivenName("   ")).toEqual({
      firstname: "",
      firstname2: undefined,
      firstname3: undefined,
    });
  });
});

describe("parseFranceConnectDate", () => {
  test("retourne une Date valide pour un format ISO", () => {
    const result = parseFranceConnectDate("1990-05-15");
    expect(result).toBeInstanceOf(Date);
    expect(result && isNaN(result.getTime())).toBe(false);
  });

  test("retourne null pour une chaîne invalide", () => {
    expect(parseFranceConnectDate("pas-une-date")).toBeNull();
    expect(parseFranceConnectDate("")).toBeNull();
  });
});
