import {
  DeleteObjectCommand,
  GetObjectAclCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { FileInterface } from "./file.interface";

const {
  OUTSCALE_ACCESS_KEY_ID,
  OUTSCALE_SECRET_ACCESS_KEY,
  OUTSCALE_BUCKET_NAME,
  OUTSCALE_OBJECT_STORAGE_ENDPOINT,
} = process.env;

const SIGNED_URL_EXPIRE_SECONDS = 60 * 5;

export interface FileServiceInterface {
  uploadFile(file: FileInterface, data: Buffer): Promise<void>;
  deleteFile(file: FileInterface): Promise<void>;
  getUploadLink(file: FileInterface): Promise<string | undefined>;
  getDownloadLink(file: FileInterface): Promise<string | undefined>;
  exists(file: FileInterface): Promise<boolean>;
}

export class FileService implements FileServiceInterface {
  private static instance: FileService;

  private readonly client: S3Client;

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }

    return FileService.instance;
  }

  private constructor() {
    try {
      if (OUTSCALE_ACCESS_KEY_ID === undefined) {
        throw new Error("OUTSCALE_ACCESS_KEY_ID name is missing");
      }

      if (OUTSCALE_SECRET_ACCESS_KEY === undefined) {
        throw new Error("OUTSCALE_SECRET_ACCESS_KEY name is missing");
      }

      if (OUTSCALE_BUCKET_NAME === undefined) {
        throw new Error("OUTSCALE_BUCKET_NAME name is missing");
      }

      if (OUTSCALE_OBJECT_STORAGE_ENDPOINT === undefined) {
        throw new Error("OUTSCALE_OBJECT_STORAGE_ENDPOINT name is missing");
      }

      this.client = new S3Client({
        endpoint: OUTSCALE_OBJECT_STORAGE_ENDPOINT,
        credentials: {
          accessKeyId: OUTSCALE_ACCESS_KEY_ID,
          secretAccessKey: OUTSCALE_SECRET_ACCESS_KEY,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to init S3 Service Provider");
    }
  }

  async getUploadLink(file: FileInterface): Promise<string | undefined> {
    const link = this.getSignedUrlForUpload(file.fileKeyPath);
    return link;
  }

  async getDownloadLink(file: FileInterface): Promise<string | undefined> {
    const link = this.getSignedUrlForDownload(file.fileKeyPath);
    return link;
  }

  async exists(file: FileInterface): Promise<boolean> {
    if (!OUTSCALE_BUCKET_NAME) {
      throw new Error("Bucket name is missing");
    }

    try {
      const command = new GetObjectAclCommand({
        Bucket: OUTSCALE_BUCKET_NAME,
        Key: file.fileKeyPath,
      });
      const result = await this.client.send(command);
      return result?.$metadata?.httpStatusCode == 200 ? true : false;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  public async uploadFile(file: FileInterface, data: Buffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: OUTSCALE_BUCKET_NAME,
      Key: file.fileKeyPath,
      Body: data,
      ContentType: file.fileType,
    });

    try {
      const response = await this.client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  }

  public async deleteFile(file: FileInterface): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: OUTSCALE_BUCKET_NAME,
      Key: file.fileKeyPath,
    });

    try {
      const response = await this.client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  }

  private async getSignedUrlForUpload(
    fileKeyPath: string
  ): Promise<string | undefined> {
    try {
      const command = new PutObjectCommand({
        Bucket: OUTSCALE_BUCKET_NAME,
        Key: fileKeyPath,
      });
      const url = await getSignedUrl(this.client, command, {
        expiresIn: SIGNED_URL_EXPIRE_SECONDS,
      });
      return url;
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }

  private async getSignedUrlForDownload(
    fileKeyPath: string
  ): Promise<string | undefined> {
    try {
      const command = new GetObjectCommand({
        Bucket: OUTSCALE_BUCKET_NAME,
        Key: fileKeyPath,
      });
      const url = await getSignedUrl(this.client, command, {
        expiresIn: SIGNED_URL_EXPIRE_SECONDS,
      });
      return url;
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }
}
