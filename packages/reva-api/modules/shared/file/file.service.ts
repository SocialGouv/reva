import { buffer } from "stream/consumers";

import {
  DeleteObjectCommand,
  GetObjectAclCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { filetypeinfo } from "magic-bytes.js";

import { logger } from "../logger/logger";

import { UploadedFile } from "./file.interface";

export type S3File = {
  filePath: string;
  mimeType: string;
  data: Buffer;
  allowedFileTypes: string[];
};

const SIGNED_URL_EXPIRE_SECONDS = 60 * 30;

const createS3Client = () => {
  if (
    !process.env.OUTSCALE_ACCESS_KEY_ID ||
    !process.env.OUTSCALE_SECRET_ACCESS_KEY ||
    !process.env.OUTSCALE_BUCKET_NAME ||
    !process.env.OUTSCALE_BUCKET_REGION ||
    !process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT
  ) {
    return undefined;
  }

  return new S3Client({
    endpoint: process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT,
    region: process.env.OUTSCALE_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.OUTSCALE_ACCESS_KEY_ID,
      secretAccessKey: process.env.OUTSCALE_SECRET_ACCESS_KEY,
    },
  });
};

let client = createS3Client();

const getClient = () => {
  if (!client) {
    client = createS3Client();
  }

  return client;
};

export const getUploadLink = async (
  filePath: string,
): Promise<string | undefined> => getSignedUrlForUpload(filePath);

export const getDownloadLink = async ({
  filePath,
  filename,
}: {
  filePath: string;
  filename?: string;
}): Promise<string | undefined> => getSignedUrlForDownload(filePath, filename);

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const command = new GetObjectAclCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: filePath,
    });
    const result = await getClient()?.send(command);
    return result?.$metadata?.httpStatusCode === 200;
  } catch (error) {
    console.error(error);
    logger.error(error);
    return false;
  }
};

export const uploadFile = async ({
  filePath,
  data,
  allowedFileTypes,
}: S3File): Promise<void> => {
  console.log(process.env.OUTSCALE_BUCKET_NAME);

  const infoFromMagicBytes = filetypeinfo(data);

  const typesFromMagicBytes = infoFromMagicBytes
    .map((type) => type.mime)
    .filter(Boolean);

  const isAllowed = allowedFileTypes.some((type) =>
    typesFromMagicBytes.includes(type),
  );

  if (!isAllowed) {
    throw new Error("File type not allowed");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.OUTSCALE_BUCKET_NAME,
    Key: filePath,
    Body: data,
    ContentType: infoFromMagicBytes[0].mime,
  });

  try {
    await getClient()?.send(command);
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const uploadWithRetry = async ({
  filePath,
  mimeType,
  data,
  allowedFileTypes,
  retry = 0,
}: S3File & {
  retry?: number;
}) => {
  await uploadFile({ filePath, mimeType, data, allowedFileTypes });

  const exists = await fileExists(filePath);
  if (!exists && retry < 3) {
    await wait(1000);
    await uploadWithRetry({
      filePath,
      mimeType,
      data,
      allowedFileTypes,
      retry: retry + 1,
    });
  } else if (!exists) {
    throw new Error(
      `Une erreur est survenue lors de l'envoi de(s) fichier(s). Veuillez réessayer.`,
    );
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.OUTSCALE_BUCKET_NAME,
    Key: filePath,
  });

  try {
    await getClient()?.send(command);
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

export const getSignedUrlForUpload = async (
  filePath: string,
): Promise<string | undefined> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: filePath,
    });
    if (!client) return;
    return await getSignedUrl(client, command, {
      expiresIn: SIGNED_URL_EXPIRE_SECONDS,
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    return undefined;
  }
};

const buildContentDisposition = (filename?: string) => {
  if (!filename) return undefined;

  const sanitizedFilename = filename.replace(/["\r\n]/g, "");
  const encodedFilename = encodeURIComponent(sanitizedFilename);

  return `inline; filename="${sanitizedFilename}"; filename*=UTF-8''${encodedFilename}`;
};

export const getSignedUrlForDownload = async (
  filePath: string,
  filename?: string,
): Promise<string | undefined> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: filePath,
      ResponseContentDisposition: buildContentDisposition(filename),
    });
    if (!client) return;
    return await getSignedUrl(client, command, {
      expiresIn: SIGNED_URL_EXPIRE_SECONDS,
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    return undefined;
  }
};

export const getUploadedFile = async (
  filePromise: GraphqlUploadedFile,
): Promise<UploadedFile> => {
  const file = await filePromise;
  const fileContentBuffer = await buffer(file.createReadStream());
  return {
    filename: file.filename,
    _buf: fileContentBuffer,
    mimetype: file.mimetype,
  };
};

export const emptyUploadedFileStream = async (file?: GraphqlUploadedFile) => {
  try {
    if (file) {
      const stream = (await file).createReadStream();
      stream.on("data", () => null);
    }
  } catch (_) {
    //do nothing
  }
};

export const uploadFileToS3 = ({
  filePath,
  mimeType,
  data,
  allowedFileTypes,
}: S3File) =>
  uploadWithRetry({
    filePath,
    mimeType,
    data,
    allowedFileTypes,
  });

export const uploadFilesToS3 = async (files: S3File[]) => {
  try {
    for (const data of files) {
      await uploadWithRetry({
        filePath: data.filePath,
        mimeType: data.mimeType,
        data: data.data,
        allowedFileTypes: data.allowedFileTypes,
      });
    }

    return;
  } catch (error) {
    console.error(error);
  }

  for (const data of files) {
    await deleteFile(data.filePath);
  }

  throw new Error(
    `Une erreur est survenue lors de l'envoi de(s) fichier(s). Veuillez réessayer.`,
  );
};
