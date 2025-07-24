import { getCandidacy } from "@/modules/candidacy/features/getCandidacy";
import { getBasicSkillsByCandidacyId } from "@/modules/candidacy/training/features/getBasicSkillsByCandidacyId";
import { getMandatoryTrainingsByCandidacyId } from "@/modules/candidacy/training/features/getMandatoryTrainingsByCandidacyId ";

import { getFundingRequest as getFundingRequestDb } from "../database/fundingRequests";

export const getFundingRequest = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await getCandidacy({ candidacyId });

  const candidacyBasicSkills = await getBasicSkillsByCandidacyId({
    candidacyId,
  });

  const candidacyMandatoryTrainings = await getMandatoryTrainingsByCandidacyId({
    candidacyId,
  });

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
          basicSkills: candidacyBasicSkills.map((b: any) => b.basicSkill),
          mandatoryTrainings: candidacyMandatoryTrainings.map(
            (t: any) => t.training,
          ),
        },
      }
    : null;
};
