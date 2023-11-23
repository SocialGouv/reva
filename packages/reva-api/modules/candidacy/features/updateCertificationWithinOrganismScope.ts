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
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`
    );
  }

  // TODO: ensure the certification is handle by current candidacy organism
  // TODO: allow certification update only at the beginning of the candidacy

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
