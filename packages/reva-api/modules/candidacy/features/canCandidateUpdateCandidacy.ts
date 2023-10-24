import { isBefore } from "date-fns";

import { prismaClient } from "../../../prisma/client";

export const canCandidateUpdateCandidacy = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<boolean> => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: { candidacyStatuses: { where: { isActive: true } } },
  });

  if (!candidacy || !candidacy.candidacyStatuses.length) {
    return false;
  }

  const candidacyStatus = candidacy.candidacyStatuses[0];
  const statusOk = ["PROJET", "VALIDATION", "PRISE_EN_CHARGE"].includes(
    candidacyStatus.status
  );
  const firstAppointmentDateOk =
    !candidacy.firstAppointmentOccuredAt ||
    isBefore(new Date(), candidacy.firstAppointmentOccuredAt);

  return statusOk && firstAppointmentDateOk;
};
