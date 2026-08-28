import { faker } from "@faker-js/faker";
import { Account, LegalStatus } from "@prisma/client";

import * as updateAccount from "@/modules/account/features/updateAccount";
import * as legalInformationEmails from "@/modules/organism/emails/sendLegalInformationDocumentsDecisionEmail";
import * as fileService from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { createMaisonMereAapLegalInformationDocumentsHelper } from "@/test/helpers/entities/create-maison-mere-aap-legal-information-documents-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const adminAuthorization = authorizationHeaderForUser({
  role: "admin",
  keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
});

// Keycloak, S3 et Brevo ne sont pas joignables depuis les tests.
const mockExternals = () => ({
  updateAccountById: vi
    .spyOn(updateAccount, "updateAccountById")
    .mockImplementation(() => Promise.resolve({} as Account)),
  deleteFile: vi.spyOn(fileService, "deleteFile").mockResolvedValue(undefined),
  approvalEmail: vi
    .spyOn(legalInformationEmails, "sendLegalInformationDocumentsApprovalEmail")
    .mockResolvedValue(undefined),
  updateNeededEmail: vi
    .spyOn(
      legalInformationEmails,
      "sendLegalInformationDocumentsUpdateNeededEmail",
    )
    .mockResolvedValue(undefined),
  totalUpdateEmail: vi
    .spyOn(
      legalInformationEmails,
      "sendLegalInformationTotalUpdateRequestEmail",
    )
    .mockResolvedValue(undefined),
  nonConformityEmail: vi
    .spyOn(legalInformationEmails, "sendLegalInformationNonConformityEmail")
    .mockResolvedValue(undefined),
});

let externals: ReturnType<typeof mockExternals>;

beforeEach(() => {
  externals = mockExternals();
});

type DecisionArguments = {
  maisonMereAAPId: string;
  decision: "VALIDE" | "DEMANDE_DE_PRECISION" | "DEMANDE_DE_MISE_A_JOUR_TOTALE";
  internalComment?: string;
  aapComment?: string;
  nonConformityMotives?: { label: string; message: string }[];
  makeInvisible?: boolean;
};

const decide = (data: DecisionArguments) =>
  injectGraphql({
    fastify: global.testApp,
    authorization: adminAuthorization,
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateLegalInformationValidationDecision",
      arguments: { data },
      enumFields: ["decision"],
      returnFields: "{ id decision }",
    },
  });

const getLegalInformationDocuments = (maisonMereAAPId: string) =>
  injectGraphql({
    fastify: global.testApp,
    authorization: adminAuthorization,
    payload: {
      requestType: "query",
      endpoint: "organism_getMaisonMereAAPById",
      arguments: { maisonMereAAPId },
      returnFields:
        "{ legalInformationDocuments { siretAlreadyUsed gestionnaireEmailAlreadyUsed } }",
    },
  });

const pendingValues = () => ({
  siret: faker.string.numeric({ length: 14 }),
  raisonSociale: "Nouvelle raison sociale",
  statutJuridique: LegalStatus.SARL,
  managerFirstname: "Jean",
  managerLastname: "Dupont",
  gestionnaireFirstname: "Marie",
  gestionnaireLastname: "Martin",
  gestionnaireEmail: "marie.martin@example.com",
  phone: "0102030405",
});

describe("Décision sur une demande de mise à jour des informations générales", () => {
  test("la validation applique les valeurs en attente, réactive la structure et supprime la demande", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      isActive: false,
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    const organisme = await createOrganismHelper({
      maisonMereAAPId: maisonMereAAP.id,
    });
    const pending = pendingValues();
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      ...pending,
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "VALIDE",
    });

    expect(response.json()).not.toHaveProperty("errors");
    // La mutation rend la décision créée, pas la maison mère.
    expect(
      response.json().data.organism_updateLegalInformationValidationDecision
        .decision,
    ).toBe("VALIDE");

    const updatedMaisonMereAAP =
      await prismaClient.maisonMereAAP.findUniqueOrThrow({
        where: { id: maisonMereAAP.id },
      });

    expect(updatedMaisonMereAAP).toMatchObject({
      siret: pending.siret,
      raisonSociale: pending.raisonSociale,
      statutJuridique: pending.statutJuridique,
      managerFirstname: pending.managerFirstname,
      managerLastname: pending.managerLastname,
      phone: pending.phone,
      isActive: true,
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_JOUR",
    });

    const updatedOrganisme = await prismaClient.organism.findUniqueOrThrow({
      where: { id: organisme.id },
    });
    expect(updatedOrganisme.siret).toBe(pending.siret);

    // Le compte gestionnaire vit dans Keycloak: seule la demande de mise à jour
    // est observable ici.
    expect(externals.updateAccountById).toHaveBeenCalledWith({
      accountId: maisonMereAAP.gestionnaireAccountId,
      accountData: {
        email: pending.gestionnaireEmail,
        firstname: pending.gestionnaireFirstname,
        lastname: pending.gestionnaireLastname,
      },
    });

    const pendingRequest =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId: maisonMereAAP.id },
      });
    expect(pendingRequest).toBeNull();

    expect(externals.approvalEmail).toHaveBeenCalledTimes(1);
  });

  test("une validation sur un SIRET déjà utilisé échoue sans enregistrer de décision", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    const pending = pendingValues();
    await createMaisonMereAapHelper({ siret: pending.siret });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      ...pending,
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "VALIDE",
    });

    expect(response.json()).toHaveProperty("errors");

    const decisions =
      await prismaClient.maisonMereAAPLegalInformationDocumentsDecision.findMany(
        { where: { maisonMereAAPId: maisonMereAAP.id } },
      );
    expect(decisions).toHaveLength(0);

    const unchangedMaisonMereAAP =
      await prismaClient.maisonMereAAP.findUniqueOrThrow({
        where: { id: maisonMereAAP.id },
      });
    expect(
      unchangedMaisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP,
    ).toBe("EN_ATTENTE_DE_VERIFICATION");
  });

  test("un refus de demande self-service ramène le compte à jour et supprime la demande", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      isTotalUpdate: false,
      ...pendingValues(),
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "DEMANDE_DE_PRECISION",
      aapComment: "Le justificatif est illisible",
    });

    expect(response.json()).not.toHaveProperty("errors");

    const updatedMaisonMereAAP =
      await prismaClient.maisonMereAAP.findUniqueOrThrow({
        where: { id: maisonMereAAP.id },
      });

    expect(updatedMaisonMereAAP).toMatchObject({
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_JOUR",
      siret: maisonMereAAP.siret,
      raisonSociale: maisonMereAAP.raisonSociale,
      statutJuridique: maisonMereAAP.statutJuridique,
      managerFirstname: maisonMereAAP.managerFirstname,
      managerLastname: maisonMereAAP.managerLastname,
    });

    const pendingRequest =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId: maisonMereAAP.id },
      });
    expect(pendingRequest).toBeNull();
  });

  test("un refus de demande de mise à jour totale laisse le compte à mettre à jour", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      isTotalUpdate: true,
      ...pendingValues(),
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "DEMANDE_DE_PRECISION",
      aapComment: "Le justificatif est illisible",
    });

    expect(response.json()).not.toHaveProperty("errors");

    const updatedMaisonMereAAP =
      await prismaClient.maisonMereAAP.findUniqueOrThrow({
        where: { id: maisonMereAAP.id },
      });
    expect(
      updatedMaisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP,
    ).toBe("A_METTRE_A_JOUR");

    const pendingRequest =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId: maisonMereAAP.id },
      });
    expect(pendingRequest).not.toBeNull();
  });

  test("les motifs de non-conformité composent le commentaire adressé à la structure", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      isTotalUpdate: true,
      ...pendingValues(),
    });

    const nonConformityMotives = [
      {
        label: "SIRET non concordant",
        message: "Le SIRET déclaré ne correspond pas à l'attestation fournie.",
      },
      {
        label: "Pièce d'identité incomplète dirigeant",
        message: "La pièce d'identité du dirigeant est incomplète.",
      },
    ];

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "DEMANDE_DE_PRECISION",
      aapComment: "Merci de redéposer les pièces avant le 30 du mois.",
      nonConformityMotives,
    });

    expect(response.json()).not.toHaveProperty("errors");

    const decision =
      await prismaClient.maisonMereAAPLegalInformationDocumentsDecision.findFirstOrThrow(
        { where: { maisonMereAAPId: maisonMereAAP.id } },
      );

    expect(decision.aapComment).toBe(
      [
        "Précisions à apporter :",
        `- ${nonConformityMotives[0].message}`,
        `- ${nonConformityMotives[1].message}`,
        "",
        "Merci de redéposer les pièces avant le 30 du mois.",
      ].join("\n"),
    );

    expect(externals.nonConformityEmail).toHaveBeenCalledTimes(1);
    expect(externals.updateNeededEmail).not.toHaveBeenCalled();
  });

  test("une demande de mise à jour totale avec invisibilisation rend la structure invisible", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      isActive: true,
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_JOUR",
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "DEMANDE_DE_MISE_A_JOUR_TOTALE",
      makeInvisible: true,
    });

    expect(response.json()).not.toHaveProperty("errors");

    const updatedMaisonMereAAP =
      await prismaClient.maisonMereAAP.findUniqueOrThrow({
        where: { id: maisonMereAAP.id },
      });

    expect(updatedMaisonMereAAP).toMatchObject({
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_METTRE_A_JOUR",
      isActive: false,
    });

    expect(externals.totalUpdateEmail).toHaveBeenCalledTimes(1);
  });

  test("la décision est tracée dans le journal des actions avec le commentaire interne", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      isActive: false,
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAP.id,
      ...pendingValues(),
    });

    const response = await decide({
      maisonMereAAPId: maisonMereAAP.id,
      decision: "VALIDE",
      internalComment: "Pièces vérifiées par téléphone",
    });

    expect(response.json()).not.toHaveProperty("errors");

    // Une validation écrit aussi MAISON_MERE_LEGAL_INFORMATION_UPDATED et
    // MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED sur la même maison mère.
    const logs = await prismaClient.aAPLog.findMany({
      where: {
        maisonMereAAPId: maisonMereAAP.id,
        eventType: "MAISON_MERE_LEGAL_INFORMATION_DECISION_TAKEN",
      },
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].details).toEqual({
      decision: "VALIDE",
      internalComment: "Pièces vérifiées par téléphone",
    });
  });

  test("un SIRET en attente déjà utilisé par une autre structure est signalé", async () => {
    const conflictingSiret = faker.string.numeric({ length: 14 });

    const maisonMereAAPWithConflict = await createMaisonMereAapHelper();
    await createMaisonMereAapHelper({ siret: conflictingSiret });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAPWithConflict.id,
      siret: conflictingSiret,
    });

    const conflictResponse = await getLegalInformationDocuments(
      maisonMereAAPWithConflict.id,
    );

    expect(
      conflictResponse.json().data.organism_getMaisonMereAAPById
        .legalInformationDocuments.siretAlreadyUsed,
    ).toBe(true);

    const maisonMereAAPWithoutConflict = await createMaisonMereAapHelper();
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAPWithoutConflict.id,
      siret: faker.string.numeric({ length: 14 }),
    });

    const response = await getLegalInformationDocuments(
      maisonMereAAPWithoutConflict.id,
    );

    expect(
      response.json().data.organism_getMaisonMereAAPById
        .legalInformationDocuments.siretAlreadyUsed,
    ).toBe(false);
  });

  test("une adresse électronique en attente déjà utilisée est signalée", async () => {
    const conflictingEmail = "adresse.deja.prise@example.com";

    const maisonMereAAPWithConflict = await createMaisonMereAapHelper();
    await createAccountHelper({ email: conflictingEmail });
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAPWithConflict.id,
      gestionnaireEmail: conflictingEmail,
    });

    const conflictResponse = await getLegalInformationDocuments(
      maisonMereAAPWithConflict.id,
    );

    expect(
      conflictResponse.json().data.organism_getMaisonMereAAPById
        .legalInformationDocuments.gestionnaireEmailAlreadyUsed,
    ).toBe(true);

    const maisonMereAAPWithoutConflict = await createMaisonMereAapHelper();
    await createMaisonMereAapLegalInformationDocumentsHelper({
      maisonMereAAPId: maisonMereAAPWithoutConflict.id,
      gestionnaireEmail: "adresse.disponible@example.com",
    });

    const response = await getLegalInformationDocuments(
      maisonMereAAPWithoutConflict.id,
    );

    expect(
      response.json().data.organism_getMaisonMereAAPById
        .legalInformationDocuments.gestionnaireEmailAlreadyUsed,
    ).toBe(false);
  });
});
