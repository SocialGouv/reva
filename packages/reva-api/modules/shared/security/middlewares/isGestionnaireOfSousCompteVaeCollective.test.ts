import { faker } from "@faker-js/faker";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { createSousCompteVaeCollectiveHelper } from "@/test/helpers/entities/create-sous-compte-vae-collective-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";

import { isGestionnaireOfSousCompteVaeCollective } from "./isGestionnaireOfSousCompteVaeCollective";

const makeContext = ({ keycloakId }: { keycloakId?: string }) =>
  ({
    auth: {
      userInfo: {
        sub: keycloakId,
      },
    },
  }) as unknown as MercuriusContext;

const runMiddleware = ({
  root = {},
  args = {},
  context,
  next = vi.fn().mockResolvedValue("resolved"),
}: {
  root?: any;
  args?: Record<string, any>;
  context: MercuriusContext;
  next?: IFieldResolver<unknown>;
}) => {
  const info = {} as any;
  return {
    result: isGestionnaireOfSousCompteVaeCollective(next)(
      root,
      args,
      context,
      info,
    ),
    root,
    args,
    context,
    info,
    next,
  };
};

describe("isGestionnaireOfSousCompteVaeCollective", () => {
  test("lets the request through when the caller manages the commanditaire and the sous compte belongs to it", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }
    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
    });

    const { result, root, args, context, info, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompte.id,
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).resolves.toBe("resolved");
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(root, args, context, info);
  });

  test("denies access when the caller does not manage the commanditaire", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
    });

    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompte.id,
      },
      context: makeContext({ keycloakId: faker.string.uuid() }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("denies access when the commanditaire does not exist", async () => {
    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: faker.string.uuid(),
        sousCompteVaeCollectiveId: faker.string.uuid(),
      },
      context: makeContext({ keycloakId: faker.string.uuid() }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("denies access when commanditaireVaeCollectiveId is missing from args, args.data and root", async () => {
    const { result, next } = runMiddleware({
      args: { sousCompteVaeCollectiveId: faker.string.uuid() },
      context: makeContext({ keycloakId: faker.string.uuid() }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("reads commanditaireVaeCollectiveId from args.data when args itself does not carry it (mutation input shape)", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }
    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
    });

    const { result, next } = runMiddleware({
      args: {
        data: {
          commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
          sousCompteVaeCollectiveId: sousCompte.id,
        },
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).resolves.toBe("resolved");
    expect(next).toHaveBeenCalledOnce();
  });

  test("reads commanditaireVaeCollectiveId from root.id when resolving a nested field on CommanditaireVaeCollective", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }
    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
    });

    const { result, next } = runMiddleware({
      root: { id: cohorte.commanditaireVaeCollectiveId },
      args: { sousCompteVaeCollectiveId: sousCompte.id },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).resolves.toBe("resolved");
    expect(next).toHaveBeenCalledOnce();
  });

  test("denies access when the sous compte belongs to a different commanditaire than the one supplied", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const otherCohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }
    const sousCompteOfOtherCommanditaire =
      await createSousCompteVaeCollectiveHelper({
        commanditaireVaeCollectiveId: otherCohorte.commanditaireVaeCollectiveId,
      });

    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: sousCompteOfOtherCommanditaire.id,
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("denies access when the sous compte does not exist", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }

    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId: faker.string.uuid(),
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("denies access when sousCompteVaeCollectiveId is missing from args, args.data and root", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }

    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).rejects.toThrow(NOT_AUTHORIZED_RESOURCE_ACCESS);
    expect(next).not.toHaveBeenCalled();
  });

  test("reads sousCompteVaeCollectiveId from args.data when args itself does not carry it (mutation input shape)", async () => {
    const cohorte = await createCohorteVaeCollectiveHelper();
    const gestionnaireKeycloakId =
      cohorte.commanditaireVaeCollective?.gestionnaire?.keycloakId;
    if (!gestionnaireKeycloakId) {
      throw new Error("Gestionnaire keycloak id not found");
    }
    const sousCompte = await createSousCompteVaeCollectiveHelper({
      commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
    });

    const { result, next } = runMiddleware({
      args: {
        commanditaireVaeCollectiveId: cohorte.commanditaireVaeCollectiveId,
        data: {
          sousCompteVaeCollectiveId: sousCompte.id,
        },
      },
      context: makeContext({ keycloakId: gestionnaireKeycloakId }),
    });

    await expect(result).resolves.toBe("resolved");
    expect(next).toHaveBeenCalledOnce();
  });
});
