import { add, endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import { v4 as uuidV4 } from "uuid";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import { uploadFileToS3 } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { sendJuryScheduledAAPEmail } from "../emails/sendJuryScheduledAAPEmail";
import { sendJuryScheduledCandidateEmail } from "../emails/sendJuryScheduledCandidateEmail";

interface ScheduleSessionOfJury {
  candidacyId: string;
  date: string;
  time?: string;
  timeSpecified: boolean;
  address?: string;
  information?: string;
  convocationFile?: UploadedFile;
  userKeycloakId?: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
}

export const scheduleSessionOfJury = async (params: ScheduleSessionOfJury) => {
  const {
    candidacyId,
    date,
    timeSpecified,
    time,
    address,
    information,
    convocationFile,
    userKeycloakId,
    userEmail,
    userRoles,
  } = params;

  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      dossierDeValidation: { where: { isActive: true } },
      Feasibility: { where: { isActive: true } },
      candidate: true,
      organism: true,
      Jury: { where: { isActive: true } },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  const dossierDeValidation = candidacy.dossierDeValidation[0];
  if (!dossierDeValidation) {
    throw new Error("Le dossier de validation n'a pas été envoyé");
  }

  if (dossierDeValidation.decision == "INCOMPLETE") {
    throw new Error("Le dossier de validation a été signalé");
  }

  const activeJury = candidacy.Jury[0];
  if (activeJury) {
    const dateOfJuryHasNotPassed = activeJury
      ? isBefore(new Date(), startOfDay(activeJury.dateOfSession))
      : false;

    if (!dateOfJuryHasNotPassed) {
      throw new Error("La date du jury est passée");
    }

    if (activeJury.result) {
      throw new Error("Le résultat du jury a déjà été renseigné");
    }
  }

  let dateOfSession = new Date(Number(date));
  const today = startOfDay(new Date());
  const nextTwoYears = endOfDay(add(today, { years: 2 }));
  let timeOfSession;

  if (time && timeSpecified) {
    const timeOfSessionHours = new Date(Number(time)).getHours();
    const timeOfSessionMinutes = (
      "0" + new Date(Number(time)).getMinutes()
    ).slice(-2);
    timeOfSession = `${timeOfSessionHours}:${timeOfSessionMinutes}`;
    dateOfSession = new Date(Number(time));
  }

  if (isAfter(dateOfSession, nextTwoYears)) {
    throw new Error(
      "La date du jury doit être au maximum dans les 2 prochaines années",
    );
  }

  const convocationFileId = uuidV4();
  const convocationFilePath = `candidacies/${candidacyId}/jury/${convocationFileId}`;

  if (convocationFile) {
    await uploadFileToS3({
      filePath: convocationFilePath,
      mimeType: convocationFile.mimetype,
      data: convocationFile._buf,
      allowedFileTypes: allowFileTypeByDocumentType.juryConvocationFile,
    });
  }

  await prismaClient.jury.updateMany({
    where: { candidacyId },
    data: { isActive: false },
  });

  const jury = await prismaClient.jury.create({
    data: {
      candidacy: { connect: { id: candidacyId } },
      dateOfSession,
      timeOfSession,
      timeSpecified,
      addressOfSession: address,
      informationOfSession: information,
      convocationFile:
        convocationFile && convocationFilePath
          ? {
              create: {
                name: convocationFile.filename,
                mimeType: convocationFile.mimetype,
                id: convocationFileId,
                path: convocationFilePath,
              },
            }
          : undefined,
      certificationAuthority: {
        connect: {
          id: candidacy.Feasibility[0].certificationAuthorityId || "",
        },
      },
    },
    include: {
      certificationAuthority: true,
    },
  });

  if (isAfter(dateOfSession, today) && candidacy.candidate) {
    sendJuryScheduledCandidateEmail({
      email: candidacy.candidate.email,
      convocationFile,
    });

    if (candidacy.organism?.contactAdministrativeEmail) {
      sendJuryScheduledAAPEmail({
        candidacyId,
        email: candidacy.organism?.contactAdministrativeEmail,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
      });
    }
  }

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "JURY_SESSION_SCHEDULED",
    userRoles,
    userKeycloakId,
    userEmail,
    details: { dateOfSession, timeOfSession },
  });

  return jury;
};
