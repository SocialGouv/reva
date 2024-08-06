import { CandidateTypology } from "@prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../../candidacy/database/candidacies";
import { generateJwt } from "../../../candidate/auth.helper";
import { sendTrainingEmail } from "../emails";
import { existsCandidacyHavingHadStatus } from "./existsCandidacyHavingHadStatus";
import { updateTrainingInformations } from "./updateTrainingInformations";

export const submitTraining = async ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
  training,
}: {
  candidacyId: string;
  training: {
    candidateTypologyInformations: {
      typology: CandidateTypology;
      additionalInformation: string;
    };
    basicSkillIds: string[];
    mandatoryTrainingIds: string[];
    certificateSkills: string;
    otherTraining: string;
    individualHourCount: number;
    collectiveHourCount: number;
    additionalHourCount: number;
    isCertificationPartial: boolean;
  };
} & CandidacyAuditLogUserInfo) => {
  if (
    await existsCandidacyHavingHadStatus({
      candidacyId,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    })
  ) {
    throw new Error(
      `Ce parcours ne peut pas être envoyé car la candidature fait l'objet d'une demande de financement.`,
    );
  }

  if (
    !(await existsCandidacyHavingHadStatus({
      candidacyId,
      status: "PRISE_EN_CHARGE",
    }))
  ) {
    throw new Error(
      `Ce parcours ne peut pas être envoyé car la candidature n'est pas encore prise en charge.`,
    );
  }

  await updateTrainingInformations({ candidacyId, training });

  const candidacy = await updateCandidacyStatus({
    candidacyId,
    status: "PARCOURS_ENVOYE",
  });

  if (candidacy?.email) {
    const token = generateJwt(
      { email: candidacy?.email, action: "login" },
      1 * 60 * 60 * 24 * 4,
    );
    sendTrainingEmail(candidacy.email, token);
  }

  await logCandidacyAuditEvent({
    candidacyId: candidacyId,
    eventType: "TRAINING_FORM_SUBMITTED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
