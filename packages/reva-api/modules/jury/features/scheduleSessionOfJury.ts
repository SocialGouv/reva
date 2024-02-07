import { FeasibilityStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "../../../prisma/client";
import { FileService, UploadedFile } from "../../shared/file";

interface ScheduleSessionOfJury {
  candidacyId: string;
  date: string;
  time?: string;
  address?: string;
  information?: string;
  convocationFile?: UploadedFile;
}

export const scheduleSessionOfJury = async (params: ScheduleSessionOfJury) => {
  const { candidacyId, date, time, address, information, convocationFile } =
    params;

  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidacyDropOut: true,
      candidacyStatuses: { where: { isActive: true } },
      candidate: true,
      Feasibility: { where: { isActive: true } },
      Jury: { where: { isActive: true } },
      department: true,
      certificationsAndRegions: {
        where: { isActive: true },
        include: { certification: true },
      },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }
  if (candidacy.candidacyDropOut) {
    throw new Error("La candidature a été abandonnée");
  }
  if (candidacy.candidacyStatuses?.[0]?.status === "ARCHIVE") {
    throw new Error("La candidature a été supprimée");
  }

  const feasibility = candidacy.Feasibility[0];
  if (feasibility?.decision !== FeasibilityStatus.ADMISSIBLE) {
    throw new Error(
      "Le dossier de faisabilité n'est pas actif ou n'est pas recevable",
    );
  }

  // if (
  //   !["DEMANDE_FINANCEMENT_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"].includes(
  //     candidacy.candidacyStatuses?.[0]?.status,
  //   )
  // ) {
  //   throw new Error(
  //     "Le statut de la candidature doit être DEMANDE_FINANCEMENT_ENVOYE ou DOSSIER_FAISABILITE_INCOMPLET",
  //   );
  // }

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
      dateOfSession: new Date(date),
      timeOfSession: time,
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

  // await updateCandidacyStatus({
  //   candidacyId,
  //   status: "DOSSIER_DE_VALIDATION_ENVOYE",
  // });

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
