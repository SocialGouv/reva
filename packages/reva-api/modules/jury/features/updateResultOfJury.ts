import { isBefore, startOfDay } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import {
  sendJuryResultAAPEmail,
  sendJuryResultCandidateEmail,
} from "../emails";
import { JuryInfo } from "../jury.types";
import { canManageJury } from "./canManageJury";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
  roles: KeyCloakUserRole[];
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

  if (jury.result) {
    throw new Error("Le résultat du jury a déjà été renseigné");
  }

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      dateOfResult: new Date(),
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
    userEmail,
    userRoles: roles,
    eventType: "JURY_RESULT_UPDATED",
    details: {
      result: juryInfo.result,
    },
  });

  return updatedJury;
};
