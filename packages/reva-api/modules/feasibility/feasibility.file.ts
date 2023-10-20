import { Feasibility } from "@prisma/client";

import { FileInterface, FileService } from "../shared/file";

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
}

interface FeasibilityFileData {
  candidacyId: string;
  fileId: string;
  fileType?: string;
}

export class FeasibilityFile implements FileInterface {
  fileType?: string;
  fileKeyPath: string;

  constructor(data: FeasibilityFileData) {
    this.fileType = data.fileType;
    this.fileKeyPath = `${data.candidacyId}/${data.fileId}`;
  }

  upload(data: Buffer): Promise<void> {
    return FileService.getInstance().uploadFile(this, data);
  }

  getDownloadLink(): Promise<string> {
    return FileService.getInstance().getDownloadLink(this);
  }
}

export async function uploadFeasibilityFiles(
  feasibility: Feasibility,
  feasibilityFile: UploadedFile,
  documentaryProofFile?: UploadedFile,
  certificateOfAttendanceFile?: UploadedFile
) {
  const feasibilityFileInstance = new FeasibilityFile({
    candidacyId: feasibility.candidacyId,
    fileId: feasibility.feasibilityFileId,
    fileType: feasibilityFile.mimetype,
  });

  await feasibilityFileInstance.upload(feasibilityFile.data);

  if (documentaryProofFile && feasibility.documentaryProofFileId) {
    const documentaryProofFileInstance = new FeasibilityFile({
      candidacyId: feasibility.candidacyId,
      fileId: feasibility.documentaryProofFileId,
      fileType: documentaryProofFile.mimetype,
    });

    await documentaryProofFileInstance.upload(documentaryProofFile.data);
  }

  if (
    certificateOfAttendanceFile &&
    feasibility.certificateOfAttendanceFileId
  ) {
    const certificateOfAttendanceFileInstance = new FeasibilityFile({
      candidacyId: feasibility.candidacyId,
      fileId: feasibility.certificateOfAttendanceFileId,
      fileType: certificateOfAttendanceFile.mimetype,
    });

    await certificateOfAttendanceFileInstance.upload(
      certificateOfAttendanceFile.data
    );
  }
}
