import { prismaClient } from "../../../prisma/client";
import { sendJuryResultAAPEmail } from "../emails/sendJuryResultAAPEmail";
import { sendJuryResultCandidateEmail } from "../emails/sendJuryResultCandidateEmail";
import { JuryInfo } from "../jury.types";
import { canManageJury } from "./canManageJury";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
  roles: KeyCloakUserRole[];
  keycloakId: string;
}

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

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      dateOfResult: new Date(),
      isResultProvisional: juryInfo.isResultProvisional,
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

  return updatedJury;
};
