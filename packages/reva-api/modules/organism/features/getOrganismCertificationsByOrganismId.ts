import { getActiveCertifications } from "@/modules/referential/features/getActiveCertifications";
import { prismaClient } from "@/prisma/client";

export const getOrganismCertificationsByOrganismId = async ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error("Identifiant d'organisme vide");
  }

  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
    include: {
      organismOnFormacode: true,
      managedDegrees: {
        include: {
          degree: true,
        },
      },
      organismOnConventionCollective: true,
    },
  });

  if (!organism) {
    throw new Error("Organisme non trouvé");
  }

  const certifications = await getActiveCertifications({
    domaines: organism.organismOnFormacode.map(
      (organismOnFormacode) => organismOnFormacode.formacodeId,
    ),
    levels: organism.managedDegrees.map(
      (managedDegree) => managedDegree.degree.level,
    ),
    branches: organism.organismOnConventionCollective.map(
      (organismOnConventionCollective) => organismOnConventionCollective.ccnId,
    ),
  });

  return certifications;
};
