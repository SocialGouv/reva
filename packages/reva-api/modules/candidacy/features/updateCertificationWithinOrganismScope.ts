import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { Role } from "../../account/account.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  updateCandidacyStatus,
  updateCertification,
} from "../database/candidacies";

export const updateCertificationWithinOrganismScope = async ({
  hasRole,
  candidacyId,
  certificationId,
}: {
  hasRole: (role: Role) => boolean;
  candidacyId: string;
  certificationId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      id: true,
      departmentId: true,
      organismId: true,
      candidacyDropOut: { select: { candidacyId: true } },
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`
    );
  }

  if (!candidacy.departmentId || !candidacy.organismId) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature sans département ou sans organisme"
    );
  }

  if (candidacy.candidacyDropOut) {
    throw new Error(
      "Impossible de modifier la certification d'une candidature abandonnée"
    );
  }

  // Ensure the new certification is handled by current candidacy organism
  const activeOrganism =
    await prismaClient.activeOrganismsByAvailableCertificationsAndDepartments.findFirst(
      {
        where: {
          certificationId: certificationId,
          departmentId: candidacy.departmentId,
          organismId: candidacy.organismId,
        },
      }
    );

  if (!activeOrganism) {
    throw new Error(
      "Cette certification n'est pas disponible pour cet organisme"
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
      "La certification ne peut être mise à jour qu'en début de candidature"
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
  const updatedCandidacy = await updateCertification({
    candidacyId,
    certificationId,
    departmentId: candidacy.departmentId || "",
    author: hasRole("admin") ? "admin" : "organism",
  });

  return updatedCandidacy.unsafeCoerce();
};
