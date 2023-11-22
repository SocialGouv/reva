import { v4 } from "uuid";

import { FileInterface, FileService } from "../shared/file";

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
}

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

  get file(): FileInterface {
    return { fileKeyPath: this.keyPath };
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

    await FileService.getInstance().uploadFile(
      { ...this.file, fileType: this.fileToUpload.mimetype },
      this.fileToUpload.data
    );

    const exists = await FileService.getInstance().exists(this.file);
    if (!exists && retry < 3) {
      await wait(1000);
      await this.uploadWithRetry(retry + 1);
    } else if (!exists) {
      throw new Error(`Failed to upload ${this.fileToUpload.filename}`);
    }
  }

  async getDownloadLink(): Promise<string | undefined> {
    const exists = await FileService.getInstance().exists(this.file);
    if (exists) {
      return FileService.getInstance().getDownloadLink(this.file);
    }

    return undefined;
  }

  async delete(): Promise<void> {
    const exists = await FileService.getInstance().exists(this.file);
    if (exists) {
      await FileService.getInstance().deleteFile(this.file);
    }
  }
}

export async function uploadFeasibilityFiles(
  files: FeasibilityFile[]
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
    file.delete();
  }

  return false;
}
