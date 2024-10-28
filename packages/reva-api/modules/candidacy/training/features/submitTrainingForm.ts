import { CandidateTypology } from "@prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { generateJwt } from "../../../candidate/auth.helper";
import { sendTrainingEmail } from "../emails";
import { existsCandidacyHavingHadStatus } from "./existsCandidacyHavingHadStatus";
import { updateTrainingInformations } from "./updateTrainingInformations";
import { updateCandidacyStatus } from "../../features/updateCandidacyStatus";
import { getCandidateById } from "../../../candidate/features/getCandidateById";
import { getCandidacy } from "../../features/getCandidacy";

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
    candidacyFinancingMethodIds: string[];
    candidacyFinancingMethodOtherSourceText?: string;
    estimatedCost?: number;
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

  let candidacy = await getCandidacy({ candidacyId });

  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  if (candidacy.financeModule === "hors_plateforme") {
    if (!training.candidacyFinancingMethodIds.length) {
      throw new Error(
        `Au moins une modalité de financement doit être renseignée`,
      );
    }
  }

  await updateTrainingInformations({ candidacyId, training });

  candidacy = await updateCandidacyStatus({
    candidacyId,
    status: "PARCOURS_ENVOYE",
  });

  if (!candidacy.candidateId) {
    throw new Error("La candidature n'a pas de candidat associé");
  }

  const candidate = await getCandidateById({
    candidateId: candidacy.candidateId,
  });

  if (candidate?.email) {
    const token = generateJwt(
      { email: candidate?.email, action: "login" },
      1 * 60 * 60 * 24 * 4,
    );
    sendTrainingEmail(candidate.email, token);
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
