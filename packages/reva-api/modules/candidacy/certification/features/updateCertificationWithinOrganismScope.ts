import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import { Role } from "../../../account/account.types";
import { logCandidacyAuditEvent } from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationById } from "../../../referential/features/getCertificationById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";
import { updateCandidacyStatus } from "../../features/updateCandidacyStatus";
import { updateCertification } from "./updateCertification";
import { getFeatureByKey } from "../../../feature-flipping/feature-flipping.features";

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
      departmentId: true,
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

  if (!candidacy.departmentId || !candidacy.organismId) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature sans département ou sans organisme",
    );
  }

  if (candidacy.candidacyDropOut) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature abandonnée",
    );
  }

  const isFormacodeActive = await isFormacodeFeatureActive();

  // Ensure the new certification is handled by current candidacy organism
  const activeOrganism = isFormacodeActive
    ? await prismaClient.activeOrganismByAvailableCertificationBasedOnFormacode.findFirst(
        {
          where: {
            certificationId: certificationId,
            organismId: candidacy.organismId,
          },
        },
      )
    : await prismaClient.activeOrganismByAvailableCertification.findFirst({
        where: {
          certificationId: certificationId,
          organismId: candidacy.organismId,
        },
      });

  if (!activeOrganism) {
    throw new Error(
      "Cette certification n'est pas disponible pour cet organisme",
    );
  }

  // Allow certification update only at the beginning of the candidacy
  const allowedStatues: CandidacyStatusStep[] = [
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const lastStatusWithDetails = await prismaClient.candidaciesStatus.findFirst({
    where: {
      candidacyId: candidacyId,
      isActive: true,
    },
    select: {
      status: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  if (!lastStatusWithDetails) {
    throw new Error("La certification n'a aucun statut actif");
  }

  const lastStatus = lastStatusWithDetails.status;

  if (!allowedStatues.includes(lastStatus)) {
    throw new Error(
      "La certification ne peut être mise à jour qu'en début de candidature",
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
    departmentId: candidacy.departmentId || "",
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

const isFormacodeFeatureActive = async (): Promise<boolean> => {
  const isAapSettingsV3Active = (await getFeatureByKey("AAP_SETTINGS_V3"))
    ?.isActive;
  const isAapSettingsFormacodeActive = (
    await getFeatureByKey("AAP_SETTINGS_FORMACODE")
  )?.isActive;

  return !!(isAapSettingsV3Active && isAapSettingsFormacodeActive);
};
