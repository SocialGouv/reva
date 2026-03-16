import { arePivotFieldsMatching } from "./france-connect.utils";

describe("arePivotFieldsMatching", () => {
  const baseCandidate = {
    candidateFirstname: "Jean",
    candidateLastname: "Dupont",
    candidateBirthdate: new Date("1990-05-15"),
  };

  const baseFc = {
    fcGivenName: "Jean Pierre",
    fcFamilyName: "Dupont",
    fcBirthdate: "1990-05-15",
  };

  test("returns true when all pivot fields match", () => {
    expect(arePivotFieldsMatching({ ...baseCandidate, ...baseFc })).toBe(true);
  });

  test("returns true with accent differences in names", () => {
    expect(
      arePivotFieldsMatching({
        ...baseFc,
        candidateFirstname: "René",
        candidateLastname: "Müller",
        candidateBirthdate: new Date("1990-05-15"),
        fcGivenName: "Rene",
        fcFamilyName: "Muller",
      }),
    ).toBe(true);
  });

  test("returns true with case differences", () => {
    expect(
      arePivotFieldsMatching({
        ...baseCandidate,
        ...baseFc,
        candidateFirstname: "JEAN",
        candidateLastname: "DUPONT",
      }),
    ).toBe(true);
  });

  test("returns false when firstname mismatches", () => {
    expect(
      arePivotFieldsMatching({
        ...baseCandidate,
        ...baseFc,
        candidateFirstname: "Marie",
      }),
    ).toBe(false);
  });

  test("returns false when lastname mismatches", () => {
    expect(
      arePivotFieldsMatching({
        ...baseCandidate,
        ...baseFc,
        candidateLastname: "Martin",
      }),
    ).toBe(false);
  });

  test("returns false when birthdate mismatches", () => {
    expect(
      arePivotFieldsMatching({
        ...baseCandidate,
        ...baseFc,
        candidateBirthdate: new Date("1985-01-01"),
      }),
    ).toBe(false);
  });

  test("returns false when candidate birthdate is null", () => {
    expect(
      arePivotFieldsMatching({
        ...baseFc,
        candidateFirstname: "Jean",
        candidateLastname: "Dupont",
        candidateBirthdate: null,
      }),
    ).toBe(false);
  });

  test("returns false when FC birthdate is invalid", () => {
    expect(
      arePivotFieldsMatching({
        ...baseCandidate,
        ...baseFc,
        fcBirthdate: "invalid-date",
      }),
    ).toBe(false);
  });
});
