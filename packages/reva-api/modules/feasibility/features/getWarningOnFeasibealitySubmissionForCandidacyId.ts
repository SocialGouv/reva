import { prismaClient } from "@/prisma/client";

export enum FeasibilitySubmissionWarning {
  NONE = "NONE",
  MAX_SUBMISSIONS_CROSS_CERTIFICATION_REACHED = "MAX_SUBMISSIONS_CROSS_CERTIFICATION_REACHED",
  MAX_SUBMISSIONS_UNIQUE_CERTIFICATION_REACHED = "MAX_SUBMISSIONS_UNIQUE_CERTIFICATION_REACHED",
}

export const getWarningOnFeasibilitySubmissionForCandidacyId = async (
  candidacyId: string,
): Promise<FeasibilitySubmissionWarning> => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      candidateId: true,
      certificationId: true,
      isCertificationPartial: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (!candidacy.certificationId) {
    return FeasibilitySubmissionWarning.NONE;
  }

  if (candidacy.isCertificationPartial) {
    return FeasibilitySubmissionWarning.NONE;
  }

  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      candidateId: candidacy.candidateId,
      id: { not: candidacyId },
    },
    include: {
      Feasibility: {
        where: { isActive: true },
      },
    },
  });

  const currentYear = new Date().getFullYear();

  const submittedFeasibilitiesPerCertificationId = candidacies.reduce(
    (acc, candidacy) => {
      const { isCertificationPartial, certificationId } = candidacy;

      // If the certification is partial or not set, we don't count it
      if (isCertificationPartial || !certificationId) return acc;

      const feasibility = candidacy.Feasibility[0];

      // If the feasibility is not sent, we don't count it
      if (!feasibility || !feasibility.feasibilityFileSentAt) return acc;

      const feasibilityYear = new Date(
        feasibility.feasibilityFileSentAt,
      ).getFullYear();

      // If the feasibility is not for the current year, we don't count it
      if (feasibilityYear != currentYear) return acc;

      const currentCountForCertification = acc[certificationId] || 0;

      return {
        ...acc,
        [certificationId]: currentCountForCertification + 1,
      };
    },
    {} as Record<string, number>,
  );

  const totalCrossCertifications = Object.keys(
    submittedFeasibilitiesPerCertificationId,
  ).length;
  if (totalCrossCertifications >= 3) {
    return FeasibilitySubmissionWarning.MAX_SUBMISSIONS_CROSS_CERTIFICATION_REACHED;
  }

  const totalUniqueCertification =
    submittedFeasibilitiesPerCertificationId[candidacy.certificationId] || 0;
  if (totalUniqueCertification >= 1) {
    return FeasibilitySubmissionWarning.MAX_SUBMISSIONS_UNIQUE_CERTIFICATION_REACHED;
  }

  return FeasibilitySubmissionWarning.NONE;
};
