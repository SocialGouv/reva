import { CandidacyStatusStep } from "@prisma/client";

import { Role } from "@/modules/account/account.types";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getCertificationById } from "@/modules/referential/features/getCertificationById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";

import { updateCandidacyStatus } from "../../features/updateCandidacyStatus";

import { updateCertification } from "./updateCertification";

export const updateCertificationWithinOrganismScope = async ({
  hasRole,
  candidacyId,
  certificationId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  hasRole: (role: Role) => boolean;
  candidacyId: string;
  certificationId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      id: true,
      status: true,
      candidate: { select: { departmentId: true } },
      organismId: true,
      candidacyDropOut: { select: { candidacyId: true } },
      typeAccompagnement: true,
    },
  });

  const newCertification = await getCertificationById({ certificationId });

  if (!newCertification) {
    throw new Error("Certification non trouvée");
  }

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`,
    );
  }

  if (!candidacy.candidate?.departmentId || !candidacy.organismId) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature sans département ou sans organisme",
    );
  }

  if (candidacy.candidacyDropOut) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature abandonnée",
    );
  }

  // Ensure the new certification is handled by current candidacy organism
  const activeOrganism =
    await prismaClient.activeOrganismByAvailableCertificationBasedOnFormacode.findFirst(
      {
        where: {
          certificationId: certificationId,
          organismId: candidacy.organismId,
        },
      },
    );

  if (!activeOrganism) {
    throw new Error(
      "Cette certification n'est pas disponible pour cet organisme",
    );
  }

  // Allow certification update only at the beginning of the candidacy
  const allowedStatues: CandidacyStatusStep[] = [
    "PROJET",
    "VALIDATION",
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const lastStatus = candidacy.status;

  if (!allowedStatues.includes(lastStatus)) {
    throw new Error(
      "La certification ne peut être mise à jour qu'en début de candidature",
    );
  }

  const isMultiCandidacyActive =
    userKeycloakId !== undefined &&
    userKeycloakId !== null &&
    (await isFeatureActiveForUser({
      userKeycloakId,
      feature: "MULTI_CANDIDACY",
    }));

  // Bloquer le changement de certification si DF incomplet et MULTI_CANDIDACY actif (sauf pour l'admin)
  if (
    isMultiCandidacyActive &&
    lastStatus === "DOSSIER_FAISABILITE_INCOMPLET" &&
    !hasRole("admin")
  ) {
    throw new Error(
      "Impossible de modifier la certification lorsque le dossier de faisabilité est incomplet",
    );
  }

  // Add new candidacy PRISE_EN_CHARGE active status, if it's not already the case
  if (lastStatus != "PRISE_EN_CHARGE") {
    await updateCandidacyStatus({
      candidacyId,
      status: "PRISE_EN_CHARGE",
    });
  }

  // Update candidacy certification
  await updateCertification({
    candidacyId,
    certificationId,
    author: hasRole("admin") ? "admin" : "organism",
    feasibilityFormat:
      candidacy.typeAccompagnement === "ACCOMPAGNE"
        ? newCertification?.feasibilityFormat
        : "UPLOADED_PDF",
  });

  await logCandidacyAuditEvent({
    candidacyId: candidacyId,
    eventType: "CERTIFICATION_UPDATED",
    userKeycloakId,
    userEmail,
    userRoles,
    details: {
      certification: {
        id: certificationId,
        label: newCertification.label,
        codeRncp: newCertification.rncpId,
      },
    },
  });
};
