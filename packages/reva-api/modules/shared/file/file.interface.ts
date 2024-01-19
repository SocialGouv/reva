export interface FileInterface {
  fileKeyPath: string;
  fileType?: string;
}

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
}
