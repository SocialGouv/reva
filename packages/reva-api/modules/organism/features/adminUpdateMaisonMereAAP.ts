import { StatutValidationInformationsJuridiquesMaisonMereAAP } from "@prisma/client";

import { AAPAuditLogUserInfo } from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountByEmail } from "@/modules/account/features/getAccountByEmail";
import { prismaClient } from "@/prisma/client";

import { deleteOldMaisonMereAAPLegalInformationDocuments } from "./deleteOldMaisonMereAAPLegalInformationDocuments";
import { updateMaisonMereLegalInformation } from "./updateMaisonMereLegalInformation";
import { updateMaisonMereOrganismsIsActive } from "./updateMaisonMereOrganismsIsActive";

export const adminUpdateLegalInformationValidationStatus = async (params: {
  maisonMereAAPId: string;
  maisonMereAAPData: {
    statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAAP;
    internalComment?: string;
    aapComment?: string;
  };
  userInfo: AAPAuditLogUserInfo;
  // Non déductible du statut cible: un refus peut aussi laisser la structure à jour.
  isValidated: boolean;
}) => {
  const { maisonMereAAPId, maisonMereAAPData, userInfo, isValidated } = params;

  // Hors du try/catch: le message d'erreur (SIRET ou email déjà utilisé) doit remonter tel quel.
  if (isValidated) {
    await applyPendingLegalInformation({ maisonMereAAPId, userInfo });
  }

  try {
    const maisonMereAAP = await prismaClient.maisonMereAAP.update({
      where: { id: maisonMereAAPId },
      data: maisonMereAAPData,
      include: {
        gestionnaire: true,
      },
    });

    if (isValidated) {
      // La validation rend la structure visible même si elle avait été invisibilisée.
      await updateMaisonMereOrganismsIsActive({
        maisonMereAAPId,
        isActive: true,
        userInfo,
      });

      await deleteOldMaisonMereAAPLegalInformationDocuments({
        maisonMereAAPId,
      });
    }

    return maisonMereAAP;
  } catch (e) {
    throw new Error(
      `Impossible de modifier le statut de validation des documents légaux: ${e}.`,
    );
  }
};

const applyPendingLegalInformation = async ({
  maisonMereAAPId,
  userInfo,
}: {
  maisonMereAAPId: string;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const pendingValues =
    await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
      where: { maisonMereAAPId },
    });

  if (!pendingValues) {
    return;
  }

  const hasPendingValues = [
    pendingValues.siret,
    pendingValues.raisonSociale,
    pendingValues.statutJuridique,
    pendingValues.gestionnaireFirstname,
    pendingValues.gestionnaireLastname,
    pendingValues.gestionnaireEmail,
    pendingValues.phone,
  ].some((value) => value !== null);

  // Demande antérieure à la mise en place des valeurs en attente: seuls les noms du
  // dirigeant sont à reporter, rejouer la mise à jour complète échouerait sur une
  // structure dont le SIRET en base est irrégulier.
  if (!hasPendingValues) {
    await prismaClient.maisonMereAAP.update({
      where: { id: maisonMereAAPId },
      data: {
        managerFirstname: pendingValues.managerFirstname,
        managerLastname: pendingValues.managerLastname,
      },
    });

    return;
  }

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUniqueOrThrow({
    where: { id: maisonMereAAPId },
    include: { gestionnaire: true },
  });

  const pendingEmail = pendingValues.gestionnaireEmail?.toLowerCase();

  // L'unicité de l'email est vérifiée par `updateAccountById`, mais celui-ci n'est
  // appelé qu'après l'écriture de la maison mère et de ses organismes: sans ce
  // contrôle en amont, un email déjà pris laisserait une mise à jour partielle.
  if (
    pendingEmail &&
    pendingEmail !== maisonMereAAP.gestionnaire.email.toLowerCase()
  ) {
    const accountWithEmail = await getAccountByEmail(pendingEmail);

    if (
      accountWithEmail &&
      accountWithEmail.id !== maisonMereAAP.gestionnaire.id
    ) {
      throw new Error(
        `L'adresse électronique ${pendingEmail} est déjà utilisée`,
      );
    }
  }

  // Les valeurs en attente sont nullables (demandes déposées avant leur mise en
  // place): on retombe alors sur les valeurs courantes de la structure.
  await updateMaisonMereLegalInformation({
    maisonMereAAPId,
    siret: pendingValues.siret ?? maisonMereAAP.siret,
    raisonSociale: pendingValues.raisonSociale ?? maisonMereAAP.raisonSociale,
    statutJuridique:
      pendingValues.statutJuridique ?? maisonMereAAP.statutJuridique,
    managerFirstname: pendingValues.managerFirstname,
    managerLastname: pendingValues.managerLastname,
    gestionnaireFirstname:
      pendingValues.gestionnaireFirstname ??
      maisonMereAAP.gestionnaire.firstname ??
      "",
    gestionnaireLastname:
      pendingValues.gestionnaireLastname ??
      maisonMereAAP.gestionnaire.lastname ??
      "",
    gestionnaireEmail:
      pendingValues.gestionnaireEmail ?? maisonMereAAP.gestionnaire.email,
    phone: pendingValues.phone ?? maisonMereAAP.phone ?? "",
    // Pas de colonne dédiée: on repasse la valeur dérivée de la typologie
    // courante, ce qui laisse la gestion des branches inchangée.
    gestionBranch:
      maisonMereAAP.typologie === "expertBranche" ||
      maisonMereAAP.typologie === "expertBrancheEtFiliere",
    userInfo,
  });
};
