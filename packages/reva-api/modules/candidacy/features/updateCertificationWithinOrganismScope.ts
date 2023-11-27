import { prismaClient } from "../../../prisma/client";
import { Role } from "../../account/account.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import { updateCertification } from "../database/candidacies";

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
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`
    );
  }
  // TODO: allow certification update only at the beginning of the candidacy
  // Ensure the new certification is handled by current candidacy organism
  const activeOrganism =
    await prismaClient.activeOrganismsByAvailableCertificationsAndDepartments.findFirst(
      {
        where: {
          certificationId: certificationId,
          departmentId: candidacy.departmentId || "",
          organismId: candidacy.organismId || "",
        },
      }
    );

  if (!activeOrganism) {
    throw new Error(
      "Cette certification n'est pas disponible pour cet organisme"
    );
  }

  try {
    (
      await updateCertification({
        candidacyId,
        certificationId,
        departmentId: candidacy.departmentId || "",
        author: hasRole("admin") ? "admin" : "organism",
      })
    ).unsafeCoerce();

    return candidacy;
  } catch (e) {
    logger.error(e);
    throw new FunctionalError(
      FunctionalCodeError.CERTIFICATION_NOT_UPDATED,
      `Erreur lors de la mise à jour de la certification`
    );
  }
};
