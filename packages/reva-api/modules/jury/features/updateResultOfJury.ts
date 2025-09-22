import { isBefore, startOfDay } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { sendJuryResultAAPEmail } from "../emails/sendJuryResultAAPEmail";
import { sendJuryResultCandidateEmail } from "../emails/sendJuryResultCandidateEmail";
import { JuryInfo } from "../jury.types";

import { canManageJury } from "./canManageJury";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
  roles: KeyCloakUserRole[];
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
}

export const updateResultOfJury = async (params: UpdateResultOfJury) => {
  const { juryId, juryInfo, roles, keycloakId, userEmail } = params;

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

  let isResultTemporary = false;

  if (params.hasRole("admin")) {
    isResultTemporary = true;
  }

  if (jury.result) {
    throw new Error("Le résultat du jury a déjà été renseigné");
  }

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      isResultTemporary,
      dateOfResult: new Date(),
      informationOfResult:
        juryInfo.informationOfResult == ""
          ? undefined
          : juryInfo.informationOfResult,
    },
  });

  // When the candidacy has a failed jury result,
  // the user can submit another dossier de validation
  // So we need to reset the "ready for jury estimated date"
  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  if (failedJuryResults.includes(juryInfo.result)) {
    await prismaClient.candidacy.update({
      where: {
        id: jury.candidacyId,
      },
      data: {
        readyForJuryEstimatedAt: null,
      },
    });
  }

  const { candidacy } = jury;

  if (candidacy.candidate) {
    await sendJuryResultCandidateEmail({
      email: candidacy.candidate.email,
    });

    if (candidacy.organism?.contactAdministrativeEmail) {
      await sendJuryResultAAPEmail({
        candidacyId: candidacy.id,
        email: candidacy.organism?.contactAdministrativeEmail,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
      });
    }
  }
  await logCandidacyAuditEvent({
    candidacyId: candidacy.id,
    userKeycloakId: keycloakId,
    userEmail,
    userRoles: roles,
    eventType: "JURY_RESULT_UPDATED",
    details: {
      result: juryInfo.result,
    },
  });

  return updatedJury;
};
