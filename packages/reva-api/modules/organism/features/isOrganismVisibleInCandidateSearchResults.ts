import { prismaClient } from "../../../prisma/client";

export const isOrganismVisibleInCandidateSearchResults = async ({
  organismId,
}: {
  organismId: string;
}) => {
  const o = await prismaClient.organism.findUnique({
    where: { id: organismId },
    include: {
      maisonMereAAP: {
        select: { isActive: true },
      },
      managedDegrees: true,
      organismOnFormacode: true,
      organismOnConventionCollective: true,
    },
  });

  if (!o) {
    return false;
  }

  return (
    o.maisonMereAAP?.isActive &&
    o.modaliteAccompagnementRenseigneeEtValide &&
    !o.fermePourAbsenceOuConges &&
    o.managedDegrees.length &&
    (o.organismOnFormacode.length || o.organismOnConventionCollective.length)
  );
};
