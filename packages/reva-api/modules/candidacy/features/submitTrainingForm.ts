import { CandidacyStatusStep } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { CandidateTypology } from "../candidacy.types";
import { updateCandidacyStatus } from "./updateCandidacyStatus";
import { generateJwt } from "../../candidate/auth.helper";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { sendTrainingEmail } from "../mails/sendTrainingEmail";

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
    !(await existsCandidacyHavingHadStatus({
      candidacyId,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    }))
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

const existsCandidacyHavingHadStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) =>
  !!(await prismaClient.candidacy.count({
    where: {
      id: params.candidacyId,
      candidacyStatuses: {
        some: {
          status: params.status,
        },
      },
    },
  }));

const updateTrainingInformations = async (params: {
  candidacyId: string;
  training: {
    basicSkillIds: string[];
    mandatoryTrainingIds: string[];
    certificateSkills: string;
    otherTraining: string;
    individualHourCount: number;
    collectiveHourCount: number;
    additionalHourCount: number;
    isCertificationPartial: boolean;
  };
}) =>
  prismaClient.$transaction([
    prismaClient.basicSkillOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    }),
    prismaClient.basicSkillOnCandidacies.createMany({
      data: params.training.basicSkillIds.map((id) => ({
        candidacyId: params.candidacyId,
        basicSkillId: id,
      })),
    }),
    prismaClient.trainingOnCandidacies.deleteMany({
      where: {
        candidacyId: params.candidacyId,
      },
    }),
    prismaClient.trainingOnCandidacies.createMany({
      data: params.training.mandatoryTrainingIds.map((id) => ({
        candidacyId: params.candidacyId,
        trainingId: id,
      })),
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        certificateSkills: params.training.certificateSkills,
        otherTraining: params.training.otherTraining,
        individualHourCount: params.training.individualHourCount,
        collectiveHourCount: params.training.collectiveHourCount,
        additionalHourCount: params.training.additionalHourCount,
        isCertificationPartial: params.training.isCertificationPartial,
      },
    }),
  ]);
