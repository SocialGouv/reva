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
      organismOnDomaine: true,
      organismOnConventionCollective: true,
    },
  });

  return (
    o &&
    o.isActive &&
    (o.isOnSite || o.isRemote) &&
    !o.fermePourAbsenceOuConges &&
    o.managedDegrees.length &&
    (o.organismOnDomaine.length || o.organismOnConventionCollective.length)
  );
};
