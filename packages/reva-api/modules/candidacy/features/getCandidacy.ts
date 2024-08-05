import { prismaClient } from "../../../prisma/client";
import { candidacyIncludes } from "./updateAppointmentInformations";

export const getCandidacy = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: {
      ...candidacyIncludes,
      candidate: {
        include: {
          highestDegree: true,
          vulnerabilityIndicator: true,
        },
      },
    },
  });

  const certificationAndRegion =
    await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
      where: {
        candidacyId: candidacy?.id,
        isActive: true,
      },
      include: {
        certification: true,
        region: true,
      },
    });

  return candidacy
    ? {
        ...candidacy,
        firstname: candidacy.candidate?.firstname,
        lastname: candidacy.candidate?.lastname,
        phone: candidacy.candidate?.phone || null,
        email: candidacy.candidate?.email || candidacy.email,
        regionId: certificationAndRegion?.region.id,
        region: certificationAndRegion?.region,
        certificationId: certificationAndRegion?.certification.id,
        certification: certificationAndRegion && {
          ...certificationAndRegion?.certification,
          codeRncp: certificationAndRegion?.certification.rncpId,
        },
        ccnId: candidacy.ccnId || null,
        conventionCollective: candidacy.ccn || null,
      }
    : null;
};
