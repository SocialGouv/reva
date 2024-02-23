import { isBefore, startOfDay } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import { sendJuryResultAAPEmail } from "../emails/sendJuryResultAAPEmail";
import { sendJuryResultCandidateEmail } from "../emails/sendJuryResultCandidateEmail";
import { JuryInfo, JuryResult } from "../jury.types";
import { canManageJury } from "./canManageJury";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
  roles: KeyCloakUserRole[];
  keycloakId: string;
}

const isResultProvisionalEnabled = (result: JuryResult): boolean => {
  const authorizedValues = [
    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  ];

  const enabled = authorizedValues.indexOf(result) != -1;

  return enabled;
};

export const updateResultOfJury = async (params: UpdateResultOfJury) => {
  const { juryId, juryInfo, roles, keycloakId } = params;

  const jury = await prismaClient.jury.findUnique({
    where: { id: juryId, isActive: true },
    include: {
      candidacy: {
        include: {
          organism: true,
          candidate: true,
        },
      },
    },
  });

  if (!jury) {
    throw new Error("Le jury n'est pas actif ou n'existe pas");
  }

  const authorized = await canManageJury({
    candidacyId: jury.candidacyId,
    roles,
    keycloakId,
  });
  if (!authorized) {
    throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
  }

  const dateOfJuryHasNotPassed = jury
    ? isBefore(new Date(), startOfDay(jury.dateOfSession))
    : false;

  if (dateOfJuryHasNotPassed) {
    throw new Error("La date du jury n'est pas passée");
  }

  if (jury.result) {
    throw new Error("Le résultat du jury a déjà été renseigné");
  }

  if (
    isResultProvisionalEnabled(juryInfo.result) &&
    juryInfo.isResultProvisional == undefined
  ) {
    throw new Error(
      "Veuillez préciser si le résultat du jury est définif ou provisoir",
    );
  }

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      dateOfResult: new Date(),
      isResultProvisional: isResultProvisionalEnabled(juryInfo.result)
        ? juryInfo.isResultProvisional
        : undefined,
      informationOfResult:
        juryInfo.informationOfResult == ""
          ? undefined
          : juryInfo.informationOfResult,
    },
  });

  const { candidacy } = jury;

  if (candidacy.candidate) {
    sendJuryResultCandidateEmail({
      email: candidacy.candidate.email,
    });

    if (candidacy.organism?.contactAdministrativeEmail) {
      sendJuryResultAAPEmail({
        candidacyId: candidacy.id,
        email: candidacy.organism?.contactAdministrativeEmail,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
      });
    }
  }
  await logCandidacyAuditEvent({
    candidacyId: candidacy.id,
    userKeycloakId: keycloakId,
    eventType: "JURY_RESULT_UPDATED",
  });

  return updatedJury;
};
