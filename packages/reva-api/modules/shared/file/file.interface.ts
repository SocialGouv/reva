export interface FileInterface {
  fileKeyPath: string;
  fileType?: string;
}

export interface UploadedFile {
  _buf: Buffer;
  filename: string;
  mimetype: string;
}
