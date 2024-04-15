import { v4 as uuidV4 } from "uuid";

import { add, endOfDay, isAfter, isBefore, startOfDay } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { FileService, UploadedFile } from "../../shared/file";
import {
  sendJuryScheduledAAPEmail,
  sendJuryScheduledCandidateEmail,
} from "../emails";

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
      Feasibility: { where: { isActive: true } },
      candidate: true,
      organism: true,
      Jury: { where: { isActive: true } },
      candidacyStatuses: true,
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  const isDossierDeValidationSent =
    candidacy.candidacyStatuses?.findIndex(
      ({ status }) => status == "DOSSIER_DE_VALIDATION_ENVOYE",
    ) != -1;

  const isDemandeDePaiementSent =
    candidacy.candidacyStatuses?.findIndex(
      ({ status }) => status == "DEMANDE_PAIEMENT_ENVOYEE",
    ) != -1;

  // Need to check if isDemandeDePaiementSent for historical candidacies
  if (!isDossierDeValidationSent && !isDemandeDePaiementSent) {
    throw new Error("Le dossier de validation n'a pas été envoyé");
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
  if (convocationFile) {
    await uploadFile({
      candidacyId,
      fileUuid: convocationFileId,
      file: convocationFile,
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
      convocationFile: convocationFile
        ? {
            create: {
              name: convocationFile.filename,
              mimeType: convocationFile.mimetype,
              id: convocationFileId,
            },
          }
        : undefined,
      certificationAuthority: {
        connect: { id: candidacy.Feasibility[0].certificationAuthorityId },
      },
    },
    include: {
      certificationAuthority: true,
    },
  });

  if (candidacy.candidate) {
    sendJuryScheduledCandidateEmail({
      email: candidacy.candidate.email,
      dateOfSession,
      timeOfSession,
      addressOfSession: address,
      convocationFile,
    });

    if (candidacy.organism?.contactAdministrativeEmail) {
      sendJuryScheduledAAPEmail({
        candidacyId,
        email: candidacy.organism?.contactAdministrativeEmail,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
        dateOfSession,
        timeOfSession,
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

const uploadFile = ({
  candidacyId,
  fileUuid,
  file,
}: {
  candidacyId: string;
  fileUuid: string;
  file: UploadedFile;
}) =>
  FileService.getInstance().uploadFile(
    {
      fileKeyPath: `${candidacyId}/${fileUuid}`,
      fileType: file.mimetype,
    },
    file._buf,
  );
