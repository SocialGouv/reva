import { describe, expect, test } from "vitest";

import { buildCandidacyFixture } from "../__testUtils/fixtures.js";

import { mapGetCandidacyById } from "./getCandidacyById.mapper.js";

describe("mapGetCandidacyById", () => {
  test("maps core candidacy fields and optional nullables", () => {
    const candidacy = buildCandidacyFixture({
      candidate: {
        ...buildCandidacyFixture().candidate!,
        firstname2: "Paul",
        givenName: "Martin",
        gender: "woman",
        birthdate: "1990-05-15T00:00:00.000Z",
        country: { label: "France", isoCode: "FRA", inseeCode: "99100" },
        nationality: "Française",
      },
      organism: {
        label: "Organisme interne",
        nomPublic: "Organisme public",
        siteInternet: "https://example.com",
        contactAdministrativeEmail: "contact@example.com",
        contactAdministrativePhone: "0102030405",
      },
      isCertificationPartial: true,
    });

    const mapped = mapGetCandidacyById(candidacy);

    expect(mapped.id).toBe(candidacy.id);
    expect(mapped.candidat.prenom2).toBe("Paul");
    expect(mapped.candidat.nomUsage).toBe("Martin");
    expect(mapped.candidat.genre).toBe("FEMME");
    expect(mapped.candidat.dateNaissance).toBe(
      new Date("1990-05-15T00:00:00.000Z").toISOString(),
    );
    expect(mapped.candidat.adresse.ville).toBe("Paris");
    expect(mapped.candidat.adresse.codePostal).toBe("75001");
    expect(mapped.candidat.adresse.rue).toBe("1 rue de Rivoli");
    expect(mapped.candidat.adresse.departement?.code).toBe("75");
    expect(mapped.candidat.adresse.departement?.nom).toBe("Paris");
    expect(mapped.candidat.adresse.pays).toBe("France"); // Toujours la France, tant qu'on ne gère que les candidatures pour les résidents sur le territoire national
    expect(mapped.candidat.adresse.codePays).toBe("FRA"); // Toujours la France, tant qu'on ne gère que les candidatures pour les résidents sur le territoire national
    expect(mapped.candidat.adresse.codeInseePays).toBe("99100"); // Toujours la France, tant qu'on ne gère que les candidatures pour les résidents sur le territoire national
    expect(mapped.candidat.nationalite).toBe("Française");
    expect(mapped.candidat.codePaysDeNaissance).toBe("FRA");
    expect(mapped.candidat.codeInseePaysDeNaissance).toBe("99100");
    expect(mapped.candidat.paysDeNaissance).toBe("France");
    expect(mapped.certification.estViseePartiellement).toBe(true);
    expect(mapped.organisme).toEqual({
      nom: "Organisme public",
      siteWeb: "https://example.com",
      contact: {
        nom: "Organisme interne",
        email: "contact@example.com",
        telephone: "0102030405",
      },
    });
  });

  test.each([
    ["man", "HOMME"],
    ["woman", "FEMME"],
    ["other", "NON_SPECIFIE"],
    [null, null],
  ] as const)("maps gender %s to %s", (gender, expected) => {
    const candidacy = buildCandidacyFixture({
      candidate: {
        ...buildCandidacyFixture().candidate!,
        gender,
      },
    });

    expect(mapGetCandidacyById(candidacy).candidat.genre).toBe(expected);
  });

  test("retourne un departement null quand le candidat n'a pas de département", () => {
    const candidacy = buildCandidacyFixture({
      candidate: {
        ...buildCandidacyFixture().candidate!,
        department: null,
      },
    });

    expect(
      mapGetCandidacyById(candidacy).candidat.adresse.departement,
    ).toBeNull();
  });

  test("returns null organisme when candidacy has no organism", () => {
    const mapped = mapGetCandidacyById(
      buildCandidacyFixture({ organism: null }),
    );

    expect(mapped.organisme).toBeNull();
  });

  test("throws when candidacy is missing", () => {
    expect(() => mapGetCandidacyById(undefined)).toThrow(
      "Candidature non trouvée",
    );
  });

  test("throws when candidate is missing", () => {
    expect(() =>
      mapGetCandidacyById(buildCandidacyFixture({ candidate: null })),
    ).toThrow("La candidature n'a pas de candidat associé");
  });

  test("throws when certification is missing", () => {
    expect(() =>
      mapGetCandidacyById(buildCandidacyFixture({ certification: null })),
    ).toThrow("La candidature n'est rattachée à aucune certification");
  });
});
