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
      Feasibility: { where: { isActive: true } },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
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
