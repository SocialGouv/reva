import { prismaClient } from "@/prisma/client";

type LegalInformationDocument =
  | "attestationURSSAF"
  | "justificatifIdentiteDirigeant"
  | "lettreDeDelegation"
  | "justificatifIdentiteDelegataire";

type SubmittedLegalInformation = {
  siret?: string;
  managerFirstname?: string;
  managerLastname?: string;
  gestionnaireFirstname?: string;
  gestionnaireLastname?: string;
};

const isDifferent = (left?: string | null, right?: string | null) =>
  (left ?? "").trim() !== (right ?? "").trim();

const hasChanged = (submitted?: string | null, current?: string | null) =>
  submitted !== undefined && isDifferent(submitted, current);

// Pièces exigées par la mise à jour, recalculées à partir des valeurs soumises et de
// l'état de la structure: ni les blocs annoncés ni la case "délégataire" du client ne
// peuvent alléger ce qui est demandé.
export const getRequiredLegalInformationDocuments = async ({
  maisonMereAAPId,
  submitted,
  delegataire,
}: {
  maisonMereAAPId: string;
  submitted: SubmittedLegalInformation;
  delegataire: boolean;
}): Promise<LegalInformationDocument[]> => {
  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
    include: { gestionnaire: true },
  });

  // Hors compte à jour, la demande reprend l'ensemble des informations et remplace
  // la précédente: toutes les pièces sont attendues, y compris pour une valeur
  // inchangée, sinon un envoi partiel effacerait les pièces déjà déposées.
  const isTotalUpdate =
    maisonMereAAP?.statutValidationInformationsJuridiquesMaisonMereAAP !==
    "A_JOUR";

  const siretChanged =
    isTotalUpdate || hasChanged(submitted.siret, maisonMereAAP?.siret);

  const managerChanged =
    isTotalUpdate ||
    hasChanged(submitted.managerFirstname, maisonMereAAP?.managerFirstname) ||
    hasChanged(submitted.managerLastname, maisonMereAAP?.managerLastname);

  const administratorChanged =
    isTotalUpdate ||
    hasChanged(
      submitted.gestionnaireFirstname,
      maisonMereAAP?.gestionnaire?.firstname,
    ) ||
    hasChanged(
      submitted.gestionnaireLastname,
      maisonMereAAP?.gestionnaire?.lastname,
    );

  // La case du client ne peut qu'ajouter la délégation: deux identités distinctes
  // l'exigent de toute façon.
  const administratorIsAnotherPerson =
    delegataire ||
    isDifferent(submitted.gestionnaireFirstname, submitted.managerFirstname) ||
    isDifferent(submitted.gestionnaireLastname, submitted.managerLastname);

  const required: LegalInformationDocument[] = [];

  if (siretChanged || managerChanged || administratorChanged) {
    required.push("attestationURSSAF");
  }

  // Retirer le délégataire rend le compte au dirigeant: son identité est alors
  // exigée, même si son nom n'a pas bougé.
  if (
    managerChanged ||
    (administratorChanged && !administratorIsAnotherPerson)
  ) {
    required.push("justificatifIdentiteDirigeant");
  }

  if (administratorChanged && administratorIsAnotherPerson) {
    required.push("lettreDeDelegation", "justificatifIdentiteDelegataire");
  }

  return required;
};
