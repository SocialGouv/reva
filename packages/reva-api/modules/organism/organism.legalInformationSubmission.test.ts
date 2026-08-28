import { faker } from "@faker-js/faker";

import * as FILE from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";

const asGestionnaire = (keycloakId: string) =>
  authorizationHeaderForUser({
    role: "gestion_maison_mere_aap",
    keycloakId,
  });

const pdfFile = () => new File([], "document.pdf", { type: "application/pdf" });

// Dirigeant enregistré sur la structure : renvoyé tel quel, il n'exige aucune pièce.
const dirigeant = { managerFirstname: "Jean", managerLastname: "Dupont" };

const allDocuments = () => ({
  attestationURSSAF: pdfFile(),
  justificatifIdentiteDirigeant: pdfFile(),
  lettreDeDelegation: pdfFile(),
  justificatifIdentiteDelegataire: pdfFile(),
});

const postLegalInformation = ({
  maisonMereAAPId,
  authorization,
  fields,
  files = {},
}: {
  maisonMereAAPId: string;
  authorization: string;
  fields: Record<string, string>;
  files?: Record<string, File>;
}) => {
  const formData = new FormData();

  for (const [name, value] of Object.entries(fields)) {
    formData.append(name, value);
  }
  for (const [name, file] of Object.entries(files)) {
    formData.append(name, file);
  }

  return global.testApp.inject({
    method: "POST",
    url: `api/maisonMereAAP/${maisonMereAAPId}/legal-information`,
    headers: {
      authorization,
      "content-type": "multipart/form-data",
    },
    body: formData,
  });
};

const getLegalInformationDocuments = (maisonMereAAPId: string) =>
  prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
    where: { maisonMereAAPId },
  });

beforeEach(() => {
  vi.spyOn(FILE, "uploadFileToS3").mockImplementation(() => Promise.resolve());
  vi.spyOn(FILE, "deleteFile").mockImplementation(() => Promise.resolve());
});

describe("Dépôt d'une demande de mise à jour des informations générales", () => {
  test("le gestionnaire dépose une demande : les valeurs sont mises en attente et la structure reste inchangée", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper(dirigeant);

    const nouveauSiret = faker.string.numeric({ length: 14 });
    const nouvelEmail = faker.internet.email();
    const nouveauTelephone = "0102030405";

    const resp = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization: asGestionnaire(maisonMereAAP.gestionnaire.keycloakId),
      // Le client envoie toujours l'ensemble des champs, même inchangés : seul
      // le changement de SIRET exige ici l'attestation URSSAF.
      fields: {
        ...dirigeant,
        siret: nouveauSiret,
        raisonSociale: "Nouvelle raison sociale",
        statutJuridique: "SARL",
        gestionnaireFirstname: maisonMereAAP.gestionnaire.firstname ?? "",
        gestionnaireLastname: maisonMereAAP.gestionnaire.lastname ?? "",
        gestionnaireEmail: nouvelEmail,
        phone: nouveauTelephone,
      },
      files: {
        attestationURSSAF: new File([], "urssaf.jpeg", { type: "image/jpeg" }),
      },
    });

    expect(resp.statusCode).toEqual(200);

    const documents = await getLegalInformationDocuments(maisonMereAAP.id);
    expect(documents).toMatchObject({
      siret: nouveauSiret,
      raisonSociale: "Nouvelle raison sociale",
      statutJuridique: "SARL",
      managerFirstname: "Jean",
      managerLastname: "Dupont",
      gestionnaireFirstname: maisonMereAAP.gestionnaire.firstname,
      gestionnaireLastname: maisonMereAAP.gestionnaire.lastname,
      gestionnaireEmail: nouvelEmail,
      phone: nouveauTelephone,
      isTotalUpdate: false,
    });

    const maisonMereAAPMiseAJour = await prismaClient.maisonMereAAP.findUnique({
      where: { id: maisonMereAAP.id },
      include: { gestionnaire: true },
    });
    expect(maisonMereAAPMiseAJour?.siret).toEqual(maisonMereAAP.siret);
    expect(maisonMereAAPMiseAJour?.gestionnaire.email).toEqual(
      maisonMereAAP.gestionnaire.email,
    );
    expect(
      maisonMereAAPMiseAJour?.statutValidationInformationsJuridiquesMaisonMereAAP,
    ).toEqual("EN_ATTENTE_DE_VERIFICATION");
  });

  test("une demande déposée sur un compte à mettre à jour est marquée comme mise à jour totale", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper({
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_METTRE_A_JOUR",
      ...dirigeant,
    });

    const resp = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization: asGestionnaire(maisonMereAAP.gestionnaire.keycloakId),
      fields: {
        ...dirigeant,
        siret: maisonMereAAP.siret,
        delegataire: "true",
      },
      files: allDocuments(),
    });

    expect(resp.statusCode).toEqual(200);

    const documents = await getLegalInformationDocuments(maisonMereAAP.id);
    expect(documents?.isTotalUpdate).toBe(true);
  });

  test("une pièce obligatoire manquante est refusée", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper(dirigeant);

    const resp = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization: asGestionnaire(maisonMereAAP.gestionnaire.keycloakId),
      // Changer le dirigeant exige son justificatif d'identité, ici omis.
      fields: {
        managerFirstname: "Paul",
        managerLastname: "Martin",
      },
      files: { attestationURSSAF: pdfFile() },
    });

    expect(resp.statusCode).toEqual(400);

    expect(await getLegalInformationDocuments(maisonMereAAP.id)).toBeNull();

    const maisonMereAAPInchangee = await prismaClient.maisonMereAAP.findUnique({
      where: { id: maisonMereAAP.id },
    });
    expect(
      maisonMereAAPInchangee?.statutValidationInformationsJuridiquesMaisonMereAAP,
    ).toEqual("A_JOUR");
  });

  test("un format de fichier non pris en charge est refusé", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper(dirigeant);

    const resp = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization: asGestionnaire(maisonMereAAP.gestionnaire.keycloakId),
      fields: {
        ...dirigeant,
        siret: faker.string.numeric({ length: 14 }),
      },
      files: {
        attestationURSSAF: new File([], "urssaf.txt", { type: "text/plain" }),
      },
    });

    expect(resp.statusCode).toEqual(400);
    expect(await getLegalInformationDocuments(maisonMereAAP.id)).toBeNull();
  });

  test("une nouvelle demande remplace la précédente", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper(dirigeant);
    const authorization = asGestionnaire(maisonMereAAP.gestionnaire.keycloakId);

    const premierSiret = faker.string.numeric({ length: 14 });
    const secondSiret = faker.string.numeric({ length: 14 });

    const premiereDemande = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization,
      fields: {
        ...dirigeant,
        siret: premierSiret,
        phone: "0102030405",
        delegataire: "true",
      },
      files: allDocuments(),
    });
    expect(premiereDemande.statusCode).toEqual(200);

    // La structure est désormais en attente de vérification : la seconde demande est
    // une mise à jour totale et doit reporter l'ensemble des pièces.
    const secondeDemande = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization,
      fields: {
        ...dirigeant,
        siret: secondSiret,
        phone: "0605040302",
        delegataire: "true",
      },
      files: allDocuments(),
    });
    expect(secondeDemande.statusCode).toEqual(200);

    const demandes =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findMany({
        where: { maisonMereAAPId: maisonMereAAP.id },
      });
    expect(demandes).toHaveLength(1);
    expect(demandes[0]).toMatchObject({
      siret: secondSiret,
      phone: "0605040302",
    });
  });

  test("le gestionnaire d'une autre structure est refusé", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper(dirigeant);
    const autreMaisonMereAAP = await createMaisonMereAapHelper();

    const resp = await postLegalInformation({
      maisonMereAAPId: maisonMereAAP.id,
      authorization: asGestionnaire(autreMaisonMereAAP.gestionnaire.keycloakId),
      fields: dirigeant,
    });

    expect(resp.statusCode).toEqual(403);
    expect(await getLegalInformationDocuments(maisonMereAAP.id)).toBeNull();
  });
});
