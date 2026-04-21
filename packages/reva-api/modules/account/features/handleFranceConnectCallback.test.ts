import { faker } from "@faker-js/faker";

import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { buildFranceConnectClaims } from "@/test/helpers/entities/fc-claims-helper";

import * as birthplaceModule from "./france-connect-birthplace";
import {
  FranceConnectForbiddenError,
  FranceConnectReconciliationError,
} from "./france-connect.errors";
import { getOrCreateCandidate } from "./handleFranceConnectCallback";

const FC_KEYCLOAK_ID = "11111111-1111-4111-8111-111111111111";
const MATCHING_PIVOTS = {
  firstname: "Jean",
  lastname: "Dupont",
  birthdate: new Date("1990-05-15"),
};

const mockKeycloakAdmin = ({
  listFederatedIdentities = vi.fn().mockResolvedValue([]),
  delFromFederatedIdentity = vi.fn().mockResolvedValue(undefined),
}: Partial<{
  listFederatedIdentities: ReturnType<typeof vi.fn>;
  delFromFederatedIdentity: ReturnType<typeof vi.fn>;
}> = {}) => {
  const admin = {
    users: {
      listFederatedIdentities,
      delFromFederatedIdentity,
    },
  };
  vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
    () =>
      Promise.resolve(admin) as unknown as ReturnType<
        typeof getKeycloakAdminModule.getKeycloakAdmin
      >,
  );
  return {
    listFederatedIdentities,
    delFromFederatedIdentity,
  };
};

describe("getOrCreateCandidate - réconciliation FranceConnect", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_APP_REALM", "test-realm");

    vi.spyOn(
      birthplaceModule,
      "resolveBirthplaceFromInseeCode",
    ).mockResolvedValue({
      cityName: "Paris",
      departmentCode: "75",
    });
  });

  test("crée un nouveau candidat quand aucun compte n'existe pour ce keycloakId ni pour cet email", async () => {
    mockKeycloakAdmin();
    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      email: `new-${faker.string.uuid()}@example.com`,
    });

    const result = await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    expect(result.isNewAccount).toBe(true);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: result.candidate.id },
    });
    expect(dbCandidate).not.toBeNull();
    expect(dbCandidate?.firstname).toBe("Jean");
    expect(dbCandidate?.lastname).toBe("Dupont");
    expect(dbCandidate?.franceConnectLinked).toBe(true);
    expect(dbCandidate?.keycloakId).toBe(FC_KEYCLOAK_ID);
  });

  test("met à jour le candidat existant quand le keycloakId et les données pivots correspondent", async () => {
    mockKeycloakAdmin();
    const birthplaceSpy = vi.mocked(
      birthplaceModule.resolveBirthplaceFromInseeCode,
    );

    await createCandidateHelper({
      keycloakId: FC_KEYCLOAK_ID,
      firstname: MATCHING_PIVOTS.firstname,
      lastname: MATCHING_PIVOTS.lastname,
      birthdate: MATCHING_PIVOTS.birthdate,
      birthCity: null,
      birthDepartmentId: null,
    });

    const claims = buildFranceConnectClaims({ sub: FC_KEYCLOAK_ID });

    const result = await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    expect(result.isNewAccount).toBe(false);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: result.candidate.id },
    });
    const expectedCityName = (await birthplaceSpy.mock.results[0]?.value)
      ?.cityName;
    expect(dbCandidate?.birthCity).toBe(expectedCityName);
  });

  test("rejette avec FranceConnectReconciliationError et délie l'identité FC quand les pivots ne correspondent pas", async () => {
    const spies = mockKeycloakAdmin({
      listFederatedIdentities: vi
        .fn()
        .mockResolvedValue([{ identityProvider: "franceconnect-particulier" }]),
    });

    await createCandidateHelper({
      keycloakId: FC_KEYCLOAK_ID,
      firstname: MATCHING_PIVOTS.firstname,
      lastname: "Martin",
      birthdate: MATCHING_PIVOTS.birthdate,
    });

    const claims = buildFranceConnectClaims({ sub: FC_KEYCLOAK_ID });

    await expect(
      getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never),
    ).rejects.toMatchObject({
      name: "FranceConnectReconciliationError",
    });

    try {
      await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);
    } catch (error) {
      expect(error).toBeInstanceOf(FranceConnectReconciliationError);
      expect((error as Error).message).toContain("lastname");
    }

    expect(spies.listFederatedIdentities).toHaveBeenCalled();
    expect(spies.delFromFederatedIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        id: FC_KEYCLOAK_ID,
        federatedIdentityId: "franceconnect-particulier",
        realm: "test-realm",
      }),
    );
  });

  test("crée un candidat sans birthCity ni birthDepartmentId quand birthplace est manquant", async () => {
    mockKeycloakAdmin();
    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      email: `no-birthplace-${faker.string.uuid()}@example.com`,
      birthplace: undefined,
    });

    const result = await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    expect(result.isNewAccount).toBe(true);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: result.candidate.id },
    });
    expect(dbCandidate?.birthCity).toBeNull();
    expect(dbCandidate?.birthDepartmentId).toBeNull();
  });

  test("crée un candidat avec birthCity mais birthDepartmentId null quand le département retourné par l'API Geo n'existe pas en base", async () => {
    mockKeycloakAdmin();
    vi.mocked(
      birthplaceModule.resolveBirthplaceFromInseeCode,
    ).mockResolvedValue({
      cityName: "Nantes",
      departmentCode: "999",
    });

    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      email: `dept-missing-${faker.string.uuid()}@example.com`,
    });

    const result = await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    expect(result.isNewAccount).toBe(true);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: result.candidate.id },
    });
    expect(dbCandidate?.birthCity).toBe("Nantes");
    expect(dbCandidate?.birthDepartmentId).toBeNull();
  });

  test("crée un candidat sans birthCity ni birthDepartmentId quand l'API Geo échoue", async () => {
    mockKeycloakAdmin();
    vi.mocked(
      birthplaceModule.resolveBirthplaceFromInseeCode,
    ).mockResolvedValue(null);

    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      email: `geo-fail-${faker.string.uuid()}@example.com`,
      birthplace: "99999",
    });

    const result = await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    expect(result.isNewAccount).toBe(true);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: result.candidate.id },
    });
    expect(dbCandidate?.birthCity).toBeNull();
    expect(dbCandidate?.birthDepartmentId).toBeNull();
  });

  test("ne remplace jamais un birthCity / birthDepartmentId déjà présent sur un candidat FC existant (backfill only)", async () => {
    mockKeycloakAdmin();
    const parisDepartment = await prismaClient.department.findFirst({
      where: { code: "75" },
    });
    const existingDepartmentId = parisDepartment?.id ?? null;

    const existing = await createCandidateHelper({
      keycloakId: FC_KEYCLOAK_ID,
      firstname: MATCHING_PIVOTS.firstname,
      lastname: MATCHING_PIVOTS.lastname,
      birthdate: MATCHING_PIVOTS.birthdate,
      birthCity: "Nantes",
      birthDepartmentId: existingDepartmentId,
    });

    const claims = buildFranceConnectClaims({ sub: FC_KEYCLOAK_ID });

    await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: existing.id },
    });
    expect(dbCandidate?.birthCity).toBe("Nantes");
    expect(dbCandidate?.birthDepartmentId).toBe(existingDepartmentId);
  });

  test("écrase birthDepartmentId avec null quand le candidat existant est France et que FC renvoie désormais un pays étranger", async () => {
    mockKeycloakAdmin();

    const parisDepartment = await prismaClient.department.findFirst({
      where: { code: "75" },
    });
    const existingDepartmentId = parisDepartment?.id ?? null;

    const existing = await createCandidateHelper({
      keycloakId: FC_KEYCLOAK_ID,
      firstname: MATCHING_PIVOTS.firstname,
      lastname: MATCHING_PIVOTS.lastname,
      birthdate: MATCHING_PIVOTS.birthdate,
      birthCity: "Paris",
      birthDepartmentId: existingDepartmentId,
    });

    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      birthcountry: "99109", // code INSEE d'un pays étranger (Allemagne)
      birthplace: undefined,
    });

    await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: existing.id },
    });
    // Le département français obsolète a été nettoyé, cohérent avec le nouveau pays étranger
    expect(dbCandidate?.birthDepartmentId).toBeNull();
    // birthCity n'est pas envoyé par FC pour un pays étranger, il est donc conservé tel quel
    expect(dbCandidate?.birthCity).toBe("Paris");
  });

  test("remplit birthCity et birthDepartmentId lorsque le candidat existant les a null (backfill)", async () => {
    mockKeycloakAdmin();
    const birthplaceSpy = vi.mocked(
      birthplaceModule.resolveBirthplaceFromInseeCode,
    );

    const existing = await createCandidateHelper({
      keycloakId: FC_KEYCLOAK_ID,
      firstname: MATCHING_PIVOTS.firstname,
      lastname: MATCHING_PIVOTS.lastname,
      birthdate: MATCHING_PIVOTS.birthdate,
      birthCity: null,
      birthDepartmentId: null,
    });

    const claims = buildFranceConnectClaims({ sub: FC_KEYCLOAK_ID });

    await getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: existing.id },
    });
    const expectedCityName = (await birthplaceSpy.mock.results[0]?.value)
      ?.cityName;
    expect(dbCandidate?.birthCity).toBe(expectedCityName);
    expect(dbCandidate?.birthDepartmentId).not.toBeNull();
  });

  test("rejette avec FranceConnectForbiddenError quand l'email existe avec un keycloakId différent", async () => {
    mockKeycloakAdmin();
    const sharedEmail = `conflict-${faker.string.uuid()}@example.com`;
    const otherKeycloakId = "22222222-2222-4222-8222-222222222222";

    const existing = await createCandidateHelper({
      email: sharedEmail,
      keycloakId: otherKeycloakId,
    });

    const claims = buildFranceConnectClaims({
      sub: FC_KEYCLOAK_ID,
      email: sharedEmail,
    });

    await expect(
      getOrCreateCandidate(FC_KEYCLOAK_ID, claims as never),
    ).rejects.toBeInstanceOf(FranceConnectForbiddenError);

    const dbCandidate = await prismaClient.candidate.findUnique({
      where: { id: existing.id },
    });
    expect(dbCandidate?.keycloakId).toBe(otherKeycloakId);
  });
});
