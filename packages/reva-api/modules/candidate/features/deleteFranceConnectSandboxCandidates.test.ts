import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import { deleteFranceConnectSandboxCandidates } from "./deleteFranceConnectSandboxCandidates";
import { FRANCE_CONNECT_SANDBOX_EMAILS } from "./franceConnectSandboxEmails.constant";

const SANDBOX_EMAIL_A = FRANCE_CONNECT_SANDBOX_EMAILS[0];
const SANDBOX_EMAIL_B = FRANCE_CONNECT_SANDBOX_EMAILS[1];

const buildCandidate = ({
  id,
  email,
  keycloakId,
}: {
  id: string;
  email: string;
  keycloakId: string;
}) => ({
  id,
  email,
  keycloakId,
  firstname: "Jean",
  lastname: "Dupont",
});

const mockKeycloakAdmin = ({
  usersDel = vi.fn().mockResolvedValue(undefined),
}: {
  usersDel?: ReturnType<typeof vi.fn>;
} = {}) => {
  const admin = {
    users: {
      del: usersDel,
    },
  };
  vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
    () =>
      Promise.resolve(admin) as unknown as ReturnType<
        typeof getKeycloakAdminModule.getKeycloakAdmin
      >,
  );
  return { usersDel };
};

describe("deleteFranceConnectSandboxCandidates", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_APP_REALM", "reva-app");
  });

  test("rejette un email hors liste autorisée", async () => {
    const { usersDel } = mockKeycloakAdmin();
    const findManySpy = vi.spyOn(prismaClient.candidate, "findMany");
    const deleteSpy = vi.spyOn(prismaClient.candidate, "delete");
    const transactionSpy = vi.spyOn(prismaClient, "$transaction");

    await expect(
      deleteFranceConnectSandboxCandidates({
        emails: [SANDBOX_EMAIL_A, "intrus@example.com"],
      }),
    ).rejects.toThrow(
      /Email\(s\) hors de la liste sandbox FranceConnect autorisée/,
    );

    expect(findManySpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(transactionSpy).not.toHaveBeenCalled();
    expect(usersDel).not.toHaveBeenCalled();
  });

  test("supprime le candidat et l'utilisateur Keycloak dans le realm reva-app", async () => {
    const candidate = buildCandidate({
      id: "candidate-id-1",
      email: SANDBOX_EMAIL_A,
      keycloakId: "keycloak-id-1",
    });

    const { usersDel } = mockKeycloakAdmin();
    vi.spyOn(prismaClient.candidate, "findMany").mockResolvedValue([
      candidate,
    ] as never);
    const deleteSpy = vi
      .spyOn(prismaClient.candidate, "delete")
      .mockResolvedValue(candidate as never);
    const transactionSpy = vi
      .spyOn(prismaClient, "$transaction")
      .mockResolvedValue([] as never);

    const result = await deleteFranceConnectSandboxCandidates({
      emails: [SANDBOX_EMAIL_A],
    });

    expect(result).toBe(1);

    expect(usersDel).toHaveBeenCalledTimes(1);
    expect(usersDel).toHaveBeenCalledWith({
      id: "keycloak-id-1",
      realm: "reva-app",
    });

    // La transaction doit contenir exactement 10 opérations, la dernière étant
    // le delete du candidate.
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    const transactionArg = transactionSpy.mock.calls[0][0];
    expect(Array.isArray(transactionArg)).toBe(true);
    expect((transactionArg as unknown[]).length).toBe(10);

    // Le delete final cible bien l'id du candidat.
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: "candidate-id-1" } });
  });

  test("continue la batch sur échec d'une suppression et retourne le compte de succès", async () => {
    const candidateA = buildCandidate({
      id: "candidate-id-A",
      email: SANDBOX_EMAIL_A,
      keycloakId: "keycloak-id-A",
    });
    const candidateB = buildCandidate({
      id: "candidate-id-B",
      email: SANDBOX_EMAIL_B,
      keycloakId: "keycloak-id-B",
    });

    // Le premier candidat lève une erreur Keycloak non-404, le second passe.
    const usersDel = vi
      .fn()
      .mockImplementationOnce(() => {
        const error = new Error("Erreur interne Keycloak") as Error & {
          status?: number;
        };
        error.status = 500;
        throw error;
      })
      .mockResolvedValueOnce(undefined);
    mockKeycloakAdmin({ usersDel });

    vi.spyOn(prismaClient.candidate, "findMany").mockResolvedValue([
      candidateA,
      candidateB,
    ] as never);
    vi.spyOn(prismaClient.candidate, "delete").mockResolvedValue(
      candidateB as never,
    );
    const transactionSpy = vi
      .spyOn(prismaClient, "$transaction")
      .mockResolvedValue([] as never);

    await expect(
      deleteFranceConnectSandboxCandidates({
        emails: [SANDBOX_EMAIL_A, SANDBOX_EMAIL_B],
      }),
    ).resolves.toBe(1);

    // La transaction ne doit être exécutée que pour le candidat B (le A est
    // interrompu par l'erreur Keycloak non-404).
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(usersDel).toHaveBeenCalledTimes(2);
  });

  test("tolère un 404 Keycloak (utilisateur déjà supprimé) et poursuit la suppression DB", async () => {
    const candidate = buildCandidate({
      id: "candidate-id-404",
      email: SANDBOX_EMAIL_A,
      keycloakId: "keycloak-id-404",
    });

    const usersDel = vi.fn().mockImplementationOnce(() => {
      const error = new Error("Not Found") as Error & {
        response?: { status?: number };
      };
      error.response = { status: 404 };
      throw error;
    });
    mockKeycloakAdmin({ usersDel });

    vi.spyOn(prismaClient.candidate, "findMany").mockResolvedValue([
      candidate,
    ] as never);
    const deleteSpy = vi
      .spyOn(prismaClient.candidate, "delete")
      .mockResolvedValue(candidate as never);
    const transactionSpy = vi
      .spyOn(prismaClient, "$transaction")
      .mockResolvedValue([] as never);

    const result = await deleteFranceConnectSandboxCandidates({
      emails: [SANDBOX_EMAIL_A],
    });

    expect(result).toBe(1);
    expect(usersDel).toHaveBeenCalledTimes(1);
    // La suppression DB a bien été exécutée malgré le 404 Keycloak.
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith({
      where: { id: "candidate-id-404" },
    });
  });
});
