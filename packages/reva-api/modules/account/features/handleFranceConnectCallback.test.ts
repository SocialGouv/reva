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
  findOneByName = vi
    .fn()
    .mockResolvedValue({ id: "role-id", name: "candidate" }),
  addRealmRoleMappings = vi.fn().mockResolvedValue(undefined),
  listFederatedIdentities = vi.fn().mockResolvedValue([]),
  delFromFederatedIdentity = vi.fn().mockResolvedValue(undefined),
}: Partial<{
  findOneByName: ReturnType<typeof vi.fn>;
  addRealmRoleMappings: ReturnType<typeof vi.fn>;
  listFederatedIdentities: ReturnType<typeof vi.fn>;
  delFromFederatedIdentity: ReturnType<typeof vi.fn>;
}> = {}) => {
  const admin = {
    users: {
      addRealmRoleMappings,
      listFederatedIdentities,
      delFromFederatedIdentity,
    },
    roles: {
      findOneByName,
    },
  };
  vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
    () =>
      Promise.resolve(admin) as unknown as ReturnType<
        typeof getKeycloakAdminModule.getKeycloakAdmin
      >,
  );
  return {
    findOneByName,
    addRealmRoleMappings,
    listFederatedIdentities,
    delFromFederatedIdentity,
  };
};

describe("getOrCreateCandidate - réconciliation FranceConnect", () => {
  beforeEach(() => {
    process.env.KEYCLOAK_APP_REALM = "test-realm";

    vi.spyOn(
      birthplaceModule,
      "resolveBirthplaceFromInseeCode",
    ).mockResolvedValue({
      cityName: "Paris",
      departmentCode: "75",
    });
  });

  afterEach(() => {
    delete process.env.KEYCLOAK_APP_REALM;
  });

  test("crée un nouveau candidat quand aucun compte n'existe pour ce keycloakId ni pour cet email", async () => {
    const spies = mockKeycloakAdmin();
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

    expect(spies.findOneByName).toHaveBeenCalledTimes(1);
    expect(spies.findOneByName).toHaveBeenCalledWith({
      name: "candidate",
      realm: "test-realm",
    });
    expect(spies.addRealmRoleMappings).toHaveBeenCalledTimes(1);
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
