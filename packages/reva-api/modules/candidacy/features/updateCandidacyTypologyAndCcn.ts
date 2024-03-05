import { CandidateTypology } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

export const updateCandidacyTypologyAndCcn = async (
  context: ContextAuth,
  params: {
    candidacyId: string;
    typology: CandidateTypology;
    additionalInformation?: string;
    ccnId?: string;
  },
): Promise<void> => {
  const { hasRole } = context;
  if (!(hasRole("admin") || hasRole("manage_candidacy"))) {
    throw new Error("Utilisateur non autorisé");
  }

  const { candidacyId, typology, additionalInformation, ccnId } = params;

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  if (!candidacy) {
    throw new Error(`La candidature n'existe pas`);
  }

  let ccn = null;
  if (ccnId) {
    ccn = await prismaClient.candidacyConventionCollective.findUnique({
      where: { id: ccnId },
    });
    if (!ccn) {
      throw new Error(`La convention collective n'existe pas`);
    }
  }

  const ccnRequired =
    typology === CandidateTypology.SALARIE_PRIVE ||
    typology === CandidateTypology.DEMANDEUR_EMPLOI;

  if (ccnRequired && !ccnId) {
    throw new Error(
      'Les typologies "SALARIE_PRIVE" et "DEMANDEUR_EMPLOI" doivent être associées à une convention collective.',
    );
  }

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      typology,
      typologyAdditional: additionalInformation,
      ccnId: ccnRequired ? ccnId : null,
    },
  });

  await logCandidacyAuditEvent({
    candidacyId: candidacyId,
    eventType: "TYPOLOGY_AND_CCN_INFO_UPDATED",
    userKeycloakId: context.userInfo?.sub,
    userRoles: context.userInfo?.realm_access?.roles || [],
    userEmail: context.userInfo?.email,
    details: {
      ccn: ccn ? { id: ccn.id, label: ccn.label, idcc: ccn.idcc } : undefined,
      typology,
    },
  });
};
