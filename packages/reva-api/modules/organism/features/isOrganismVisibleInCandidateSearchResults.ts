import { prismaClient } from "../../../prisma/client";

export const isOrganismVisibleInCandidateSearchResults = async ({
  organismId,
}: {
  organismId: string;
}) => {
  const o = await prismaClient.organism.findUnique({
    where: { id: organismId },
    include: {
      managedDegrees: true,
      organismOnFormacode: true,
      organismOnConventionCollective: true,
      organismInformationsCommerciales: true,
    },
  });

  if (!o) {
    return false;
  }

  return (
    o.isActive &&
    o.modaliteAccompagnementRenseigneeEtValide &&
    !o.fermePourAbsenceOuConges &&
    o.managedDegrees.length &&
    (o.organismOnFormacode.length || o.organismOnConventionCollective.length)
  );
};
