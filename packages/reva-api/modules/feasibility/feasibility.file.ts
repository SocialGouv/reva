import { v4 } from "uuid";

import {
  UploadedFile,
  deleteFile,
  fileExists,
  uploadFile,
} from "../shared/file";

interface FeasibilityFileData {
  candidacyId: string;
  fileId?: string;
  fileToUpload?: UploadedFile;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export class FeasibilityFile {
  id: string;
  keyPath: string;
  fileToUpload?: UploadedFile;

  constructor(data: FeasibilityFileData) {
    this.id = data.fileId || v4();
    this.fileToUpload = data.fileToUpload;
    this.keyPath = `${data.candidacyId}/${this.id}`;
  }

  setFileToUpload(file: UploadedFile) {
    this.fileToUpload = file;
  }

  async upload(): Promise<void> {
    await this.uploadWithRetry(0);
  }

  private async uploadWithRetry(retry: number) {
    if (!this.fileToUpload) {
      throw new Error('"fileToUpload" has not been set');
    }

    await uploadFile({
      filePath: this.keyPath,
      mimeType: this.fileToUpload.mimetype,
      data: this.fileToUpload._buf,
    });

    const exists = await fileExists(this.keyPath);
    if (!exists && retry < 3) {
      await wait(1000);
      await this.uploadWithRetry(retry + 1);
    } else if (!exists) {
      throw new Error(`Failed to upload ${this.fileToUpload.filename}`);
    }
  }
}

export async function uploadFeasibilityFiles(
  files: FeasibilityFile[],
): Promise<boolean> {
  try {
    for (const file of files) {
      await file.upload();
    }

    return true;
  } catch (error) {
    console.error(error);
  }

  for (const file of files) {
    await deleteFile(file.keyPath);
  }

  return false;
}
