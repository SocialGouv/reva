import { StatutValidationInformationsJuridiquesMaisonMereAAP } from "@prisma/client";

import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";

import { getRequiredLegalInformationDocuments } from "./getRequiredLegalInformationDocuments";

const createMaisonMere = async ({
  managerFirstname = "Jean",
  managerLastname = "Dupont",
  gestionnaireFirstname = "Jean",
  gestionnaireLastname = "Dupont",
  statut = "A_JOUR" as StatutValidationInformationsJuridiquesMaisonMereAAP,
} = {}) => {
  const gestionnaire = await createAccountHelper({
    firstname: gestionnaireFirstname,
    lastname: gestionnaireLastname,
  });

  return createMaisonMereAapHelper({
    gestionnaireAccountId: gestionnaire.id,
    managerFirstname,
    managerLastname,
    statutValidationInformationsJuridiquesMaisonMereAAP: statut,
  });
};

describe("Pièces justificatives exigées par une mise à jour des informations générales", () => {
  test("compte à jour : une modification des seules informations de contact n'exige aucune pièce", async () => {
    const maisonMereAAP = await createMaisonMere();

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: maisonMereAAP.siret,
        managerFirstname: "Jean",
        managerLastname: "Dupont",
        gestionnaireFirstname: "Jean",
        gestionnaireLastname: "Dupont",
      },
      delegataire: false,
    });

    expect(required).toEqual([]);
  });

  test("compte à jour : un changement de SIRET exige la seule attestation URSSAF", async () => {
    const maisonMereAAP = await createMaisonMere();

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: "12345678901234",
        managerFirstname: "Jean",
        managerLastname: "Dupont",
        gestionnaireFirstname: "Jean",
        gestionnaireLastname: "Dupont",
      },
      delegataire: false,
    });

    expect(required).toEqual(["attestationURSSAF"]);
  });

  test("compte à jour : un changement de dirigeant exige l'attestation URSSAF et son justificatif d'identité", async () => {
    const maisonMereAAP = await createMaisonMere();

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: maisonMereAAP.siret,
        managerFirstname: "Paul",
        managerLastname: "Durand",
        gestionnaireFirstname: "Jean",
        gestionnaireLastname: "Dupont",
      },
      delegataire: false,
    });

    expect(required).toEqual([
      "attestationURSSAF",
      "justificatifIdentiteDirigeant",
    ]);
  });

  test("compte à jour : un administrateur distinct du dirigeant exige la lettre de délégation et le justificatif du délégataire", async () => {
    const maisonMereAAP = await createMaisonMere();

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: maisonMereAAP.siret,
        // Dirigeant strictement inchangé : seule la délégation doit être exigée.
        managerFirstname: "Jean",
        managerLastname: "Dupont",
        gestionnaireFirstname: "Alice",
        gestionnaireLastname: "Martin",
      },
      delegataire: true,
    });

    expect(required).toEqual([
      "attestationURSSAF",
      "lettreDeDelegation",
      "justificatifIdentiteDelegataire",
    ]);
    expect(required).not.toContain("justificatifIdentiteDirigeant");
  });

  test("compte à jour : le retrait du délégataire exige le justificatif d'identité du dirigeant", async () => {
    const maisonMereAAP = await createMaisonMere({
      gestionnaireFirstname: "Alice",
      gestionnaireLastname: "Martin",
    });

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: maisonMereAAP.siret,
        managerFirstname: "Jean",
        managerLastname: "Dupont",
        gestionnaireFirstname: "Jean",
        gestionnaireLastname: "Dupont",
      },
      delegataire: false,
    });

    expect(required).toEqual([
      "attestationURSSAF",
      "justificatifIdentiteDirigeant",
    ]);
  });

  test("compte à mettre à jour : des noms d'administrateur absents n'exigent pas la délégation", async () => {
    const maisonMereAAP = await createMaisonMere({ statut: "A_METTRE_A_JOUR" });

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      // Les noms de l'administrateur sont facultatifs sur la route REST.
      submitted: {
        siret: maisonMereAAP.siret,
        managerFirstname: "Jean",
        managerLastname: "Dupont",
      },
      delegataire: false,
    });

    expect(required).toEqual([
      "attestationURSSAF",
      "justificatifIdentiteDirigeant",
    ]);
  });

  test("compte à mettre à jour : toutes les pièces sont exigées même sans modification", async () => {
    const maisonMereAAP = await createMaisonMere({
      gestionnaireFirstname: "Alice",
      gestionnaireLastname: "Martin",
      statut: "A_METTRE_A_JOUR",
    });

    const required = await getRequiredLegalInformationDocuments({
      maisonMereAAPId: maisonMereAAP.id,
      submitted: {
        siret: maisonMereAAP.siret,
        managerFirstname: "Jean",
        managerLastname: "Dupont",
        gestionnaireFirstname: "Alice",
        gestionnaireLastname: "Martin",
      },
      delegataire: true,
    });

    expect(required).toEqual([
      "attestationURSSAF",
      "justificatifIdentiteDirigeant",
      "lettreDeDelegation",
      "justificatifIdentiteDelegataire",
    ]);
  });
});
