import { getCandidacyFromId } from "../../../candidacy/database/candidacies";

import { getFundingRequest as getFundingRequestDb } from "../database/fundingRequests";

export const getFundingRequest = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = (
    await getCandidacyFromId(candidacyId)
  ).unsafeCoerce() as any;

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const fundingRequest = await getFundingRequestDb({ candidacyId });

  return fundingRequest
    ? {
        fundingRequest: fundingRequest && {
          ...fundingRequest,
          basicSkills: fundingRequest.basicSkills.map((b: any) => b.basicSkill),
          mandatoryTrainings: fundingRequest.mandatoryTrainings.map(
            (t: any) => t.training,
          ),
        },
        training: {
          certificateSkills: candidacy.certificateSkills || "",
          individualHourCount: candidacy.individualHourCount || 0,
          collectiveHourCount: candidacy.collectiveHourCount || 0,
          otherTraining: candidacy.otherTraining || "",
          basicSkills: candidacy.basicSkills.map((b: any) => b.basicSkill),
          mandatoryTrainings: candidacy.trainings.map((t: any) => t.training),
        },
      }
    : null;
};
